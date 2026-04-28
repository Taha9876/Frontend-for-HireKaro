from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_company
from app.models.company import Company
from app.models.job import Job, JobSkill, JobStatus
from app.schemas.job import (
    JobCreate, JobUpdate, JobResponse, JobListResponse, SkillCreate, SkillResponse
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


# ─── CREATE JOB ───────────────────────────────────────────
@router.post("", response_model=JobResponse, status_code=201)
def create_job(
    data: JobCreate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    job = Job(
        company_id=current_company.id,
        title=data.title,
        department=data.department,
        location=data.location,
        job_type=data.job_type,
        experience_level=data.experience_level,
        salary_min=data.salary_min,
        salary_max=data.salary_max,
        salary_currency=data.salary_currency,
        salary_visible=data.salary_visible,
        description=data.description,
        responsibilities=data.responsibilities,
        requirements=data.requirements,
        total_positions=data.total_positions,
        deadline=data.deadline,
        status=JobStatus.draft
    )
    db.add(job)
    db.flush()  # id generate ho jaaye skills se pehle

    # Skills add karo agar hain
    for skill_data in data.skills:
        skill = JobSkill(
            job_id=job.id,
            skill_name=skill_data.skill_name.strip().lower(),
            is_required=skill_data.is_required,
            proficiency_level=skill_data.proficiency_level
        )
        db.add(skill)

    db.commit()
    db.refresh(job)
    return job


# ─── GET ALL JOBS (Company ki apni) ───────────────────────
@router.get("", response_model=List[JobListResponse])
def get_jobs(
    status: Optional[JobStatus] = Query(None),
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    query = db.query(Job).filter(
        Job.company_id == current_company.id,
        Job.is_deleted == False
    )
    if status:
        query = query.filter(Job.status == status)

    jobs = query.order_by(Job.created_at.desc()).all()

    result = []
    for job in jobs:
        result.append(JobListResponse(
            id=job.id,
            title=job.title,
            department=job.department,
            location=job.location,
            job_type=job.job_type,
            experience_level=job.experience_level,
            status=job.status,
            total_positions=job.total_positions,
            deadline=job.deadline,
            skills_count=len(job.skills),
            candidates_count=len(job.resumes),
            created_at=job.created_at
        ))
    return result


# ─── GET SINGLE JOB ───────────────────────────────────────
@router.get("/{job_id}", response_model=JobResponse)
def get_job(
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
    return job


# ─── UPDATE JOB ───────────────────────────────────────────
@router.patch("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    data: JobUpdate,
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

    if job.status == JobStatus.archived:
        raise HTTPException(status_code=400, detail="Archived job cannot be updated")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)

    job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(job)
    return job


# ─── PUBLISH JOB (draft → active) ─────────────────────────
@router.post("/{job_id}/publish", response_model=JobResponse)
def publish_job(
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
    if job.status != JobStatus.draft:
        raise HTTPException(status_code=400, detail=f"Job is already {job.status}")
    if not job.skills:
        raise HTTPException(status_code=400, detail="Add at least one skill before publishing")

    job.status = JobStatus.active
    job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(job)
    return job


# ─── CLOSE JOB ────────────────────────────────────────────
@router.post("/{job_id}/close", response_model=JobResponse)
def close_job(
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

    job.status = JobStatus.closed
    job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(job)
    return job


# ─── DELETE JOB (soft delete) ─────────────────────────────
@router.delete("/{job_id}", status_code=204)
def delete_job(
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

    job.is_deleted = True
    job.updated_at = datetime.utcnow()
    db.commit()


# ════════════════════════════════════════════════════════════
# SKILLS ENDPOINTS
# ════════════════════════════════════════════════════════════

# ─── ADD SKILL TO JOB ─────────────────────────────────────
@router.post("/{job_id}/skills", response_model=SkillResponse, status_code=201)
def add_skill(
    job_id: int,
    data: SkillCreate,
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

    # Duplicate skill check
    existing = db.query(JobSkill).filter(
        JobSkill.job_id == job_id,
        JobSkill.skill_name == data.skill_name.strip().lower()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists for this job")

    skill = JobSkill(
        job_id=job_id,
        skill_name=data.skill_name.strip().lower(),
        is_required=data.is_required,
        proficiency_level=data.proficiency_level
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


# ─── DELETE SKILL ─────────────────────────────────────────
@router.delete("/{job_id}/skills/{skill_id}", status_code=204)
def delete_skill(
    job_id: int,
    skill_id: int,
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

    skill = db.query(JobSkill).filter(
        JobSkill.id == skill_id,
        JobSkill.job_id == job_id
    ).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(skill)
    db.commit()