from sqlalchemy import (
    Column, Integer, String, Boolean,
    DateTime, Text, Float, ForeignKey, Enum
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class JobType(str, enum.Enum):
    onsite = "onsite"
    remote = "remote"
    hybrid = "hybrid"


class ExperienceLevel(str, enum.Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"
    lead = "lead"


class JobStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    processing = "processing"
    screened = "screened"          # screening done
    interview_scheduled = "interview_scheduled"  # interview set
    closed = "closed"
    archived = "archived"
    completed="completed"


class ProficiencyLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    expert = "expert"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    job_type = Column(Enum(JobType), default=JobType.onsite)
    experience_level = Column(Enum(ExperienceLevel), default=ExperienceLevel.mid)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String(10), default="PKR")
    salary_visible = Column(Boolean, default=False)
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    total_positions = Column(Integer, default=1)
    deadline = Column(DateTime, nullable=True)
    status = Column(Enum(JobStatus), default=JobStatus.draft)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="jobs")
    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="job", cascade="all, delete-orphan")
    questions = relationship("JobQuestion", back_populates="job", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="job", cascade="all, delete-orphan")

class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    is_required = Column(Boolean, default=True)
    proficiency_level = Column(Enum(ProficiencyLevel), default=ProficiencyLevel.intermediate)
    job = relationship("Job", back_populates="skills")


class ResumeStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    shortlisted = "shortlisted"
    rejected = "rejected"


class ParseStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    # Candidate Info
    candidate_name = Column(String(255), nullable=True)
    candidate_email = Column(String(255), nullable=True)
    candidate_phone = Column(String(50), nullable=True)

    # File
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)

    # Parsing
    parse_status = Column(Enum(ParseStatus), default=ParseStatus.pending)
    parsed_data = Column(JSONB, nullable=True)  # full structured data

    # Scoring
    match_score = Column(Float, nullable=True)          # 0.0 - 1.0 overall
    skills_score = Column(Float, nullable=True)         # skills match
    experience_score = Column(Float, nullable=True)     # experience match
    education_score = Column(Float, nullable=True)      # education match
    semantic_score = Column(Float, nullable=True)       # vector similarity
    score_breakdown = Column(JSONB, nullable=True)      # detailed breakdown
    rejection_reason = Column(Text, nullable=True)      # why rejected

    # Status
    status = Column(Enum(ResumeStatus), default=ResumeStatus.pending)
    rejection_mail_sent = Column(Boolean, default=False)
    interview_mail_sent = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime, nullable=True)

    job = relationship("Job", back_populates="resumes")


class QuestionType(str, enum.Enum):
    verbal = "verbal"
    coding = "coding"
    mcq = "mcq"


class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class JobQuestion(Base):
    __tablename__ = "job_questions"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), default=QuestionType.verbal)
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.medium)
    ai_generated = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="questions")