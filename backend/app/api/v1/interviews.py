from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.core.database import get_db, SessionLocal
from app.core.dependencies import get_current_company
from app.core.interview_utils import (
    calculate_duration, generate_username,
    generate_password, hash_password, is_interview_accessible
)
from app.core.email import send_interview_email,send_reschedule_email
from app.models.company import Company
from app.models.job import Job, JobQuestion, Resume, ResumeStatus,JobStatus
from app.models.interview import Interview, InterviewCandidate, InterviewStatus
from app.core.config import settings
from app.models.interview import Interview, InterviewCandidate, InterviewStatus, InterviewAnswer, InterviewResult
from app.core.evaluation import evaluate_verbal_answer, evaluate_coding_answer, calculate_final_interview_score
from app.core.interview_utils import verify_password, is_interview_accessible
import os
from datetime import datetime

router = APIRouter(prefix="/jobs", tags=["Interviews"])


class ScheduleRequest(BaseModel):
    scheduled_date: date
    start_time: str          # "14:30"
    custom_duration: Optional[int] = None  # HR override


class CandidateLoginRequest(BaseModel):
    username: str
    password: str


# ─── GET DURATION SUGGESTION ──────────────────────────────
@router.get("/{job_id}/interview/duration")
def get_suggested_duration(
    job_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_company.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    questions = db.query(JobQuestion).filter(
        JobQuestion.job_id == job_id
    ).all()

    if not questions:
        return {"suggested_duration": 45, "breakdown": {
            "verbal": 0, "coding": 0, "mcq": 0, "total_questions": 0
        }}

    duration = calculate_duration(questions)
    verbal = sum(1 for q in questions if q.question_type.value == "verbal")
    coding = sum(1 for q in questions if q.question_type.value == "coding")
    mcq = sum(1 for q in questions if q.question_type.value == "mcq")

    return {
        "suggested_duration": duration,
        "breakdown": {
            "verbal": verbal,
            "coding": coding,
            "mcq": mcq,
            "total_questions": len(questions)
        }
    }


# ─── SCHEDULE INTERVIEW ───────────────────────────────────
@router.post("/{job_id}/interview/schedule")
def schedule_interview(
    job_id: int,
    data: ScheduleRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_company.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    shortlisted = db.query(Resume).filter(
        Resume.job_id == job_id,
        Resume.status == ResumeStatus.shortlisted
    ).all()
    if not shortlisted:
        raise HTTPException(status_code=400, detail="No shortlisted candidates found")

    questions = db.query(JobQuestion).filter(JobQuestion.job_id == job_id).all()
    duration = data.custom_duration or calculate_duration(questions)

    # Check karo existing interview hai ya nahi — reschedule case
    is_reschedule = False
    existing_interview = db.query(Interview).filter(
        Interview.job_id == job_id,
        Interview.company_id == current_company.id,
        Interview.status == InterviewStatus.scheduled
    ).first()

    if existing_interview:
        # Update karo existing
        existing_interview.scheduled_date = data.scheduled_date
        existing_interview.start_time = data.start_time
        existing_interview.duration_minutes = duration
        interview = existing_interview
        is_reschedule = True

        # Purane candidates ka data lo for re-emailing
        existing_candidates = db.query(InterviewCandidate).filter(
            InterviewCandidate.interview_id == interview.id
        ).all()

        created_candidates = []
        for ic in existing_candidates:
            created_candidates.append({
                "username": ic.username,
                "raw_password": None,  # password dobara generate nahi karte
                "candidate_email": ic.candidate_email,
                "candidate_name": ic.candidate_name,
                "is_reschedule": True
            })
        db.commit()

    else:
        # Naya interview banao
        interview = Interview(
            job_id=job_id,
            company_id=current_company.id,
            scheduled_date=data.scheduled_date,
            start_time=data.start_time,
            duration_minutes=duration,
            status=InterviewStatus.scheduled
        )
        db.add(interview)
        db.flush()

        created_candidates = []
        for resume in shortlisted:
            if not resume.candidate_email:
                continue

            raw_password = generate_password()
            username = generate_username(resume.candidate_name or "candidate", job_id)

            counter = 0
            while db.query(InterviewCandidate).filter(
                InterviewCandidate.username == username
            ).first():
                counter += 1
                username = generate_username(resume.candidate_name or "candidate", job_id + counter)

            ic = InterviewCandidate(
                interview_id=interview.id,
                resume_id=resume.id,
                candidate_name=resume.candidate_name,
                candidate_email=resume.candidate_email,
                username=username,
                hashed_password=hash_password(raw_password),
                email_sent=False
            )
            db.add(ic)
            created_candidates.append({
                "username": username,
                "raw_password": raw_password,
                "candidate_email": resume.candidate_email,
                "candidate_name": resume.candidate_name,
                "is_reschedule": False
            })

        # Job status update
        job.status = JobStatus.interview_scheduled
        db.commit()

    background_tasks.add_task(
        _send_interview_emails,
        interview_id=interview.id,
        candidates_data=created_candidates,
        job_title=job.title,
        company_name=current_company.company_name,
        scheduled_date=str(data.scheduled_date),
        start_time=data.start_time,
        duration_minutes=duration,
        frontend_url=settings.FRONTEND_URL,
        is_reschedule=is_reschedule
    )

    return {
        "message": "Interview rescheduled successfully" if is_reschedule else "Interview scheduled successfully",
        "interview_id": interview.id,
        "is_reschedule": is_reschedule,
        "scheduled_date": str(data.scheduled_date),
        "start_time": data.start_time,
        "duration_minutes": duration,
        "candidates_count": len(created_candidates)
    }


def _send_interview_emails(
    interview_id: int,
    candidates_data: list,
    job_title: str,
    company_name: str,
    scheduled_date: str,
    start_time: str,
    duration_minutes: int,
    frontend_url: str,
    is_reschedule: bool = False
):
    db = SessionLocal()
    try:
        for item in candidates_data:
            try:
                interview_link = f"{frontend_url}/interview/login"

                if is_reschedule:
                    # Reschedule email — alag subject
                    success = send_reschedule_email(
                        to_email=item["candidate_email"],
                        candidate_name=item["candidate_name"] or "Candidate",
                        job_title=job_title,
                        company_name=company_name,
                        scheduled_date=scheduled_date,
                        start_time=start_time,
                        duration_minutes=duration_minutes,
                        username=item["username"],
                        interview_link=interview_link
                    )
                else:
                    success = send_interview_email(
                        to_email=item["candidate_email"],
                        candidate_name=item["candidate_name"] or "Candidate",
                        job_title=job_title,
                        company_name=company_name,
                        scheduled_date=scheduled_date,
                        start_time=start_time,
                        duration_minutes=duration_minutes,
                        username=item["username"],
                        password=item["raw_password"],
                        interview_link=interview_link
                    )

                if success:
                    ic = db.query(InterviewCandidate).filter(
                        InterviewCandidate.username == item["username"]
                    ).first()
                    if ic:
                        ic.email_sent = True
                        db.commit()
                    print(f"{'Reschedule' if is_reschedule else 'Interview'} email sent to {item['candidate_email']}")
            except Exception as e:
                print(f"Email error for {item['candidate_email']}: {e}")
    finally:
        db.close()


# ─── CANDIDATE LOGIN ──────────────────────────────────────
@router.post("/interview/candidate-login")
def candidate_login(
    data: CandidateLoginRequest,
    db: Session = Depends(get_db)
):
    from app.core.interview_utils import verify_password

    candidate = db.query(InterviewCandidate).filter(
        InterviewCandidate.username == data.username
    ).first()

    if not candidate or not verify_password(data.password, candidate.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    interview = candidate.interview
    access = is_interview_accessible(
        interview.scheduled_date,
        interview.start_time,
        interview.duration_minutes
    )

    return {
        "candidate_name": candidate.candidate_name,
        "job_title": interview.job.title if interview.job else "",
        "scheduled_date": str(interview.scheduled_date),
        "start_time": interview.start_time,
        "duration_minutes": interview.duration_minutes,
        "access": access
    }




# ─── SUBMIT INTERVIEW ANSWERS + VIDEO ────────────────────
@router.post("/interview/submit")
async def submit_interview(
    request: Request,
    db: Session = Depends(get_db)
):
    from fastapi import Request
    body = await request.json()

    username = body.get("username")
    answers_data = body.get("answers", [])
    tab_switches = body.get("tab_switches", 0)

    candidate = db.query(InterviewCandidate).filter(
        InterviewCandidate.username == username
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Save answers
    verbal_scores, mcq_scores, coding_scores = [], [], []

    for ans in answers_data:
        q_type   = ans.get("type")
        q_text   = ans.get("question", "")
        q_id     = ans.get("id")
        answered = ans.get("answered", False)
        answer   = ans.get("answer")
        options  = ans.get("options", [])
        correct  = ans.get("correct")

        db_ans = InterviewAnswer(
            interview_candidate_id=candidate.id,
            question_id=q_id,
            question_text=q_text,
            question_type=q_type,
            answer_text=str(answer) if answer is not None else None,
            selected_option=answer if q_type == "mcq" else None,
        )

        if not answered or answer is None:
            db_ans.ai_score = 0
            db_ans.ai_feedback = "Not answered."
        elif q_type == "verbal":
            result = evaluate_verbal_answer(q_text, str(answer))
            db_ans.ai_score = result.get("score", 0)
            db_ans.ai_feedback = result.get("feedback", "")
            verbal_scores.append(db_ans.ai_score)
        elif q_type == "mcq":
            is_correct = (answer == correct)
            db_ans.is_correct = is_correct
            db_ans.ai_score = 100.0 if is_correct else 0.0
            db_ans.ai_feedback = "Correct!" if is_correct else f"Incorrect. Correct answer: {options[correct] if correct is not None and correct < len(options) else 'N/A'}"
            mcq_scores.append(db_ans.ai_score)
        elif q_type == "coding":
            result = evaluate_coding_answer(q_text, str(answer))
            db_ans.ai_score = result.get("score", 0)
            db_ans.ai_feedback = result.get("feedback", "")
            coding_scores.append(db_ans.ai_score)

        db.add(db_ans)

    # Calculate final score
    scores = calculate_final_interview_score(verbal_scores, mcq_scores, coding_scores)

    result = InterviewResult(
        interview_candidate_id=candidate.id,
        verbal_score=scores["verbal_score"],
        mcq_score=scores["mcq_score"],
        coding_score=scores["coding_score"],
        final_score=scores["final_score"],
        tab_switches=tab_switches,
        evaluated_at=datetime.utcnow()
    )
    db.add(result)
    db.commit()

    return {"message": "Interview submitted", "scores": scores}


# ─── UPLOAD VIDEO ─────────────────────────────────────────
@router.post("/interview/upload-video")
async def upload_video(
    username: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    from fastapi import UploadFile, File

    candidate = db.query(InterviewCandidate).filter(
        InterviewCandidate.username == username
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Save video
    video_dir = os.path.join(settings.UPLOAD_DIR, "interview_videos", str(candidate.interview_id))
    os.makedirs(video_dir, exist_ok=True)
    video_path = os.path.join(video_dir, f"{username}.webm")

    content = await file.read()
    with open(video_path, "wb") as f:
        f.write(content)

    # Update result
    result = db.query(InterviewResult).filter(
        InterviewResult.interview_candidate_id == candidate.id
    ).first()
    if result:
        result.video_path = video_path
        db.commit()

    return {"message": "Video uploaded", "path": video_path}


# ─── GET CANDIDATE RESULT (for HR) ───────────────────────
@router.get("/interview/{interview_id}/candidate/{candidate_id}/detail")
def get_candidate_detail(
    interview_id: int,
    candidate_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    candidate = db.query(InterviewCandidate).filter(
        InterviewCandidate.id == candidate_id,
        InterviewCandidate.interview_id == interview_id
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Not found")

    answers = db.query(InterviewAnswer).filter(
        InterviewAnswer.interview_candidate_id == candidate_id
    ).all()

    result = candidate.result

    return {
        "candidate": {
            "id": candidate.id,
            "name": candidate.candidate_name,
            "email": candidate.candidate_email,
            "username": candidate.username,
        },
        "result": {
            "verbal_score":  result.verbal_score if result else None,
            "mcq_score":     result.mcq_score if result else None,
            "coding_score":  result.coding_score if result else None,
            "final_score":   result.final_score if result else None,
            "tab_switches":  result.tab_switches if result else 0,
            "video_path": result.video_path.replace("\\", "/") if result else None,
            "evaluated_at":  str(result.evaluated_at) if result else None,
        } if result else None,
        "answers": [
            {
                "id": a.id,
                "question_text": a.question_text,
                "question_type": a.question_type,
                "answer_text": a.answer_text,
                "selected_option": a.selected_option,
                "is_correct": a.is_correct,
                "ai_score": a.ai_score,
                "ai_feedback": a.ai_feedback,
            }
            for a in answers
        ]
    }


# ─── GET ALL INTERVIEW RESULTS FOR JOB ───────────────────
@router.get("/{job_id}/interview/results")
def get_interview_results(
    job_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    interview = db.query(Interview).filter(
        Interview.job_id == job_id,
        Interview.company_id == current_company.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="No interview found for this job")

    candidates = db.query(InterviewCandidate).filter(
        InterviewCandidate.interview_id == interview.id
    ).all()

    result_list = []
    for c in candidates:
        r = c.result
        result_list.append({
            "candidate_id": c.id,
            "name": c.candidate_name or "Unknown",
            "email": c.candidate_email,
            "final_score": r.final_score if r else None,
            "verbal_score": r.verbal_score if r else None,
            "mcq_score": r.mcq_score if r else None,
            "coding_score": r.coding_score if r else None,
            "tab_switches": r.tab_switches if r else 0,
            "interviewed": r is not None,
            "interview_id": interview.id,
        })

    result_list.sort(key=lambda x: x["final_score"] or 0, reverse=True)

    return {
        "interview": {
            "id": interview.id,
            "scheduled_date": str(interview.scheduled_date),
            "start_time": interview.start_time,
            "duration_minutes": interview.duration_minutes,
        },
        "candidates": result_list
    }
