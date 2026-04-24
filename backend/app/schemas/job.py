from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from app.models.job import JobType, ExperienceLevel, JobStatus, ProficiencyLevel


# ─── SKILL SCHEMAS ─────────────────────────────────────────

class SkillCreate(BaseModel):
    skill_name: str
    is_required: bool = True
    proficiency_level: ProficiencyLevel = ProficiencyLevel.intermediate


class SkillResponse(BaseModel):
    id: int
    skill_name: str
    is_required: bool
    proficiency_level: ProficiencyLevel

    class Config:
        from_attributes = True


# ─── JOB SCHEMAS ───────────────────────────────────────────

class JobCreate(BaseModel):
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    job_type: JobType = JobType.onsite
    experience_level: ExperienceLevel = ExperienceLevel.mid
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "PKR"
    salary_visible: bool = False
    description: str
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    total_positions: int = 1
    deadline: Optional[datetime] = None
    skills: Optional[List[SkillCreate]] = []

    @validator("salary_max")
    def salary_max_check(cls, v, values):
        if v and values.get("salary_min") and v < values["salary_min"]:
            raise ValueError("salary_max must be greater than salary_min")
        return v


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[ExperienceLevel] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    salary_visible: Optional[bool] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    total_positions: Optional[int] = None
    deadline: Optional[datetime] = None
    status: Optional[JobStatus] = None


class JobResponse(BaseModel):
    id: int
    company_id: int
    title: str
    department: Optional[str]
    location: Optional[str]
    job_type: JobType
    experience_level: ExperienceLevel
    salary_min: Optional[float]
    salary_max: Optional[float]
    salary_currency: str
    salary_visible: bool
    description: str
    responsibilities: Optional[str]
    requirements: Optional[str]
    total_positions: int
    deadline: Optional[datetime]
    status: JobStatus
    skills: List[SkillResponse] = []
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    id: int
    title: str
    department: Optional[str]
    location: Optional[str]
    job_type: JobType
    experience_level: ExperienceLevel
    status: JobStatus
    total_positions: int
    deadline: Optional[datetime]
    skills_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True