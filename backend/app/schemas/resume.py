from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.job import ResumeStatus, ParseStatus


class ResumeResponse(BaseModel):
    id: int
    job_id: int
    candidate_name: Optional[str]
    candidate_email: Optional[str]
    candidate_phone: Optional[str]
    file_name: str
    file_size: int
    parse_status: ParseStatus
    match_score: Optional[float]
    status: ResumeStatus
    created_at: datetime

    class Config:
        from_attributes = True


class BulkUploadResponse(BaseModel):
    total: int
    successful: int
    failed: int
    resumes: List[ResumeResponse]