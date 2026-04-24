from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.core.database import get_db, SessionLocal
from app.core.dependencies import get_current_company
from app.core.resume_parser import extract_text, parse_resume_with_ai
from app.core.scoring import (
    embed_job_description, get_semantic_score,
    calculate_skills_score, calculate_experience_relevance,
    calculate_project_relevance, calculate_education_score,
    calculate_final_score, generate_rejection_reason
)
from app.core.email import send_shortlist_email, send_rejection_email
from app.models.company import Company
from app.models.job import Job, Resume, JobStatus, ResumeStatus, ParseStatus
from app.core.config import settings

router = APIRouter(prefix="/jobs", tags=["Screening"])


def _run_screening(job_id: int, company_name: str):
    """Background screening task"""
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return

        # Job status → processing
        job.status = JobStatus.processing
        db.commit()

        # Job description ChromaDB mein embed karo
        skills_list = [s.skill_name for s in job.skills]
        job_skills_with_required = [
            {"skill_name": s.skill_name, "is_required": s.is_required}
            for s in job.skills
        ]

        embed_job_description(
            job_id=job_id,
            job_title=job.title,
            description=job.description,
            requirements=job.requirements or "",
            skills=skills_list
        )

        # Saare pending resumes fetch karo
        resumes = db.query(Resume).filter(
            Resume.job_id == job_id,
            Resume.parse_status == ParseStatus.pending
        ).all()

        threshold = settings.SHORTLIST_THRESHOLD

        for resume in resumes:
            try:
                # Status update
                resume.parse_status = ParseStatus.processing
                db.commit()

                # Text extract karo
                raw_text = extract_text(resume.file_path)
                if not raw_text:
                    resume.parse_status = ParseStatus.failed
                    resume.status = ResumeStatus.rejected
                    resume.rejection_reason = "Could not extract text from resume file."
                    db.commit()
                    continue

                # AI se parse karo
                parsed = parse_resume_with_ai(raw_text)
                resume.parsed_data = parsed
                resume.candidate_name = parsed.get("name") or resume.candidate_name
                resume.candidate_email = parsed.get("email") or resume.candidate_email
                resume.candidate_phone = parsed.get("phone") or resume.candidate_phone

                # Scores calculate karo
                # Scores calculate karo
                resume_skills = parsed.get("skills", [])
                work_experience = parsed.get("work_experience", [])
                projects = parsed.get("projects", [])

                skills_result = calculate_skills_score(
                    job_skills_with_required, resume_skills
                )
                exp_result = calculate_experience_relevance(
                    required_level=job.experience_level.value,
                    work_experience=work_experience,
                    job_title=job.title,
                    job_skills=skills_list
                )
                proj_result = calculate_project_relevance(
                    projects=projects,
                    job_title=job.title,
                    job_skills=skills_list,
                    job_description=job.description
                )
                edu_score = calculate_education_score(parsed, job.requirements or "")
                semantic_score = get_semantic_score(job_id, raw_text[:2000])

                final_score = calculate_final_score(
                    skills_result["score"],
                    exp_result["score"],
                    proj_result["score"],
                    edu_score,
                    semantic_score
                )

                # Store scores
                resume.match_score = final_score
                resume.skills_score = skills_result["score"]
                resume.experience_score = exp_result["score"]
                resume.education_score = edu_score
                resume.semantic_score = semantic_score
                resume.score_breakdown = {
                    "skills": skills_result,
                    "experience": exp_result,
                    "projects": proj_result,
                    "education": edu_score,
                    "semantic": semantic_score,
                    "weights": {
                        "skills": 0.35,
                        "experience": 0.25,
                        "projects": 0.20,
                        "education": 0.10,
                        "semantic": 0.10
                    }
                }

                # Shortlist ya reject
                if final_score >= threshold:
                    resume.status = ResumeStatus.shortlisted
                else:
                    resume.status = ResumeStatus.rejected
                    resume.rejection_reason = generate_rejection_reason(
                    parsed, skills_result, exp_result, proj_result, final_score
                    )

                db.commit()

                # Email bhejo
                if resume.candidate_email:
                    if resume.status == ResumeStatus.shortlisted:
                        success = send_shortlist_email(
                            to_email=resume.candidate_email,
                            candidate_name=resume.candidate_name or "Candidate",
                            job_title=job.title,
                            company_name=company_name
                        )
                        if success:
                            resume.interview_mail_sent = True
                    else:
                        success = send_rejection_email(
                            to_email=resume.candidate_email,
                            candidate_name=resume.candidate_name or "Candidate",
                            job_title=job.title,
                            company_name=company_name,
                            reason=resume.rejection_reason
                        )
                        if success:
                            resume.rejection_mail_sent = True
                    db.commit()

            except Exception as e:
                print(f"Resume {resume.id} processing failed: {e}")
                resume.parse_status = ParseStatus.failed
                db.commit()
                continue

        # Job status → screened
        job.status = JobStatus.screened
        db.commit()

    except Exception as e:
        print(f"Screening failed for job {job_id}: {e}")
        try:
            job = db.query(Job).filter(Job.id == job_id).first()
            if job:
                job.status = JobStatus.active
                db.commit()
        except:
            pass
    finally:
        db.close()


# ─── TRIGGER SCREENING ────────────────────────────────────
@router.post("/{job_id}/screen", status_code=202)
def trigger_screening(
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

    resumes_count = db.query(Resume).filter(Resume.job_id == job_id).count()
    if resumes_count == 0:
        raise HTTPException(status_code=400, detail="No resumes uploaded for this job")

    if job.status == JobStatus.processing:
        raise HTTPException(status_code=400, detail="Screening already in progress")

    background_tasks.add_task(_run_screening, job_id, current_company.company_name)
    return {"message": "Screening started", "job_id": job_id, "resumes": resumes_count}


# ─── GET SCREENING RESULTS ────────────────────────────────
@router.get("/{job_id}/results")
def get_results(
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

    resumes = db.query(Resume).filter(
        Resume.job_id == job_id
    ).order_by(Resume.match_score.desc().nullslast()).all()

    total = len(resumes)
    shortlisted = [r for r in resumes if r.status == ResumeStatus.shortlisted]
    rejected = [r for r in resumes if r.status == ResumeStatus.rejected]
    scores = [r.match_score for r in resumes if r.match_score is not None]

    return {
        "job": {
            "id": job.id,
            "title": job.title,
            "status": job.status,
            "department": job.department,
            "location": job.location,
            "experience_level": job.experience_level,
            "description": job.description,
            "responsibilities": job.responsibilities,
            "requirements": job.requirements,
            "skills": [{"skill_name": s.skill_name, "is_required": s.is_required} for s in job.skills],
        },
        "metrics": {
            "total_resumes": total,
            "shortlisted": len(shortlisted),
            "rejected": len(rejected),
            "pending": total - len(shortlisted) - len(rejected),
            "max_score": round(max(scores) * 100, 1) if scores else 0,
            "min_score": round(min(scores) * 100, 1) if scores else 0,
            "avg_score": round((sum(scores) / len(scores)) * 100, 1) if scores else 0,
        },
        "candidates": [
            {
                "id": r.id,
                "name": r.candidate_name or "Unknown",
                "email": r.candidate_email,
                "phone": r.candidate_phone,
                "status": r.status,
                "match_score": round((r.match_score or 0) * 100, 1),
                "skills_score": round((r.skills_score or 0) * 100, 1),
                "experience_score": round((r.experience_score or 0) * 100, 1),
                "education_score": round((r.education_score or 0) * 100, 1),
                "semantic_score": round((r.semantic_score or 0) * 100, 1),
                "score_breakdown": r.score_breakdown,
                "rejection_reason": r.rejection_reason,
                "parse_status": r.parse_status,
                "file_name": r.file_name,
                "interview_mail_sent": r.interview_mail_sent,
                "rejection_mail_sent": r.rejection_mail_sent,
            }
            for r in resumes
        ]
    }