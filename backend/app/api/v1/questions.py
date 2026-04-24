from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_company
from app.core.ai import generate_interview_questions
from app.models.company import Company
from app.models.job import Job, JobQuestion, JobStatus
from app.schemas.question import QuestionCreate, QuestionResponse

router = APIRouter(prefix="/jobs", tags=["Questions"])


def _generate_and_save(job_id: int, db: Session):
    """Background task — questions generate karke DB mein save karo"""
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return

        skills = [{"skill_name": s.skill_name} for s in job.skills]

        questions = generate_interview_questions(
            job_title=job.title,
            description=job.description,
            responsibilities=job.responsibilities or "",
            requirements=job.requirements or "",
            skills=skills,
            count=10
        )

        # Purane AI questions delete karo (agar retry ho)
        db.query(JobQuestion).filter(
            JobQuestion.job_id == job_id,
            JobQuestion.ai_generated == True
        ).delete()

        for idx, q in enumerate(questions):
            question = JobQuestion(
                job_id=job_id,
                question_text=q.get("question_text", ""),
                question_type=q.get("question_type", "verbal"),
                difficulty=q.get("difficulty", "medium"),
                ai_generated=True,
                order_index=idx
            )
            db.add(question)

        db.commit()
    except Exception as e:
        print(f"Question generation failed for job {job_id}: {e}")


# ─── TRIGGER GENERATION ───────────────────────────────────
@router.post("/{job_id}/questions/generate", status_code=202)
def trigger_generation(
    job_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_company.id,
        Job.is_deleted == False
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    background_tasks.add_task(_generate_and_save, job_id, db)
    return {"message": "Question generation started", "job_id": job_id}


# ─── GET QUESTIONS ────────────────────────────────────────
@router.get("/{job_id}/questions", response_model=List[QuestionResponse])
def get_questions(
    job_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_company.id,
        Job.is_deleted == False
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    questions = db.query(JobQuestion).filter(
        JobQuestion.job_id == job_id
    ).order_by(JobQuestion.order_index).all()

    return questions


# ─── ADD CUSTOM QUESTION ──────────────────────────────────
@router.post("/{job_id}/questions", response_model=QuestionResponse, status_code=201)
def add_question(
    job_id: int,
    data: QuestionCreate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_company.id,
        Job.is_deleted == False
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    count = db.query(JobQuestion).filter(JobQuestion.job_id == job_id).count()
    question = JobQuestion(
        job_id=job_id,
        question_text=data.question_text,
        question_type=data.question_type,
        difficulty=data.difficulty,
        ai_generated=False,
        order_index=count
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


# ─── DELETE QUESTION ──────────────────────────────────────
@router.delete("/{job_id}/questions/{question_id}", status_code=204)
def delete_question(
    job_id: int,
    question_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_company.id,
        Job.is_deleted == False
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    q = db.query(JobQuestion).filter(
        JobQuestion.id == question_id,
        JobQuestion.job_id == job_id
    ).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(q)
    db.commit()