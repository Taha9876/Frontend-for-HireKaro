import os
import shutil
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from app.core.database import get_db
from app.core.dependencies import get_current_company
from app.core.config import settings
from app.models.company import Company
from app.models.job import Job, Resume, JobStatus, ParseStatus
from app.schemas.resume import ResumeResponse, BulkUploadResponse

router = APIRouter(prefix="/jobs", tags=["Resumes"])

ALLOWED_TYPES = ["application/pdf"]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB per file


def get_upload_path(company_id: int, job_id: int) -> str:
    """Folder path banao aur create karo agar exist nahi karta"""
    path = os.path.join(settings.UPLOAD_DIR, "resumes", str(company_id), str(job_id))
    os.makedirs(path, exist_ok=True)
    return path


def validate_file(file: UploadFile) -> None:
    """File type aur size check karo"""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"{file.filename} — sirf PDF allowed hai"
        )


# ─── BULK RESUME UPLOAD ───────────────────────────────────
@router.post("/{job_id}/resumes", response_model=BulkUploadResponse, status_code=201)
async def upload_resumes(
    job_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    # Job exist aur company ki hai?
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_company.id,
        Job.is_deleted == False
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Sirf active job pe resumes upload ho sakte hain
    if job.status != JobStatus.active:
        raise HTTPException(
            status_code=400,
            detail=f"Resumes sirf active job pe upload ho sakte hain. Job status: {job.status}"
        )

    if not files:
        raise HTTPException(status_code=400, detail="Koi file select nahi ki")

    if len(files) > 50:
        raise HTTPException(status_code=400, detail="Ek baar mein max 50 resumes upload ho sakte hain")

    upload_path = get_upload_path(current_company.id, job_id)

    successful = []
    failed = []

    for file in files:
        try:
            # File type validate karo
            validate_file(file)

            # File content read karo
            content = await file.read()

            # Size check
            if len(content) > MAX_FILE_SIZE:
                failed.append(file.filename)
                continue

            # Unique filename — timestamp + original name
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
            safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
            file_path = os.path.join(upload_path, safe_filename)

            # File save karo
            with open(file_path, "wb") as f:
                f.write(content)

            # Database mein save karo
            resume = Resume(
                job_id=job_id,
                company_id=current_company.id,
                file_name=file.filename,
                file_path=file_path,
                file_size=len(content),
                parse_status=ParseStatus.pending
            )
            db.add(resume)
            successful.append(resume)

        except HTTPException:
            failed.append(file.filename)
        except Exception:
            failed.append(file.filename)

    db.commit()
    for resume in successful:
        db.refresh(resume)

    return BulkUploadResponse(
        total=len(files),
        successful=len(successful),
        failed=len(failed),
        resumes=successful
    )


# ─── GET ALL RESUMES OF A JOB ─────────────────────────────
@router.get("/{job_id}/resumes", response_model=List[ResumeResponse])
def get_resumes(
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
    ).order_by(Resume.created_at.desc()).all()

    return resumes


# ─── GET SINGLE RESUME ────────────────────────────────────
@router.get("/{job_id}/resumes/{resume_id}", response_model=ResumeResponse)
def get_resume(
    job_id: int,
    resume_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.job_id == job_id,
        Resume.company_id == current_company.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


# ─── DOWNLOAD RESUME FILE ─────────────────────────────────
@router.get("/{job_id}/resumes/{resume_id}/download")
def download_resume(
    job_id: int,
    resume_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.job_id == job_id,
        Resume.company_id == current_company.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=resume.file_path,
        filename=resume.file_name,
        media_type="application/pdf"
    )


# ─── DELETE RESUME ────────────────────────────────────────
@router.delete("/{job_id}/resumes/{resume_id}", status_code=204)
def delete_resume(
    job_id: int,
    resume_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.job_id == job_id,
        Resume.company_id == current_company.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # File bhi delete karo
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    db.delete(resume)
    db.commit()