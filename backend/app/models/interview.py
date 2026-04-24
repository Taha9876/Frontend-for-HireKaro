from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, ForeignKey, Enum, Text,Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class InterviewStatus(str, enum.Enum):
    scheduled = "scheduled"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    scheduled_date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False)  # "14:30"
    duration_minutes = Column(Integer, nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.scheduled)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="interviews")
    candidates = relationship("InterviewCandidate", back_populates="interview", cascade="all, delete-orphan")


class InterviewCandidate(Base):
    __tablename__ = "interview_candidates"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    candidate_name = Column(String(255), nullable=True)
    candidate_email = Column(String(255), nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    email_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    interview = relationship("Interview", back_populates="candidates")
    resume = relationship("Resume")
    answers = relationship("InterviewAnswer", back_populates="candidate", cascade="all, delete-orphan")
    result = relationship("InterviewResult", back_populates="candidate", uselist=False, cascade="all, delete-orphan")




class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    interview_candidate_id = Column(Integer, ForeignKey("interview_candidates.id"), nullable=False)
    question_id = Column(Integer, nullable=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(20), nullable=False)  # verbal, mcq, coding
    answer_text = Column(Text, nullable=True)
    selected_option = Column(Integer, nullable=True)    # MCQ
    is_correct = Column(Boolean, nullable=True)         # MCQ
    ai_score = Column(Float, nullable=True)             # 0-100
    ai_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate = relationship("InterviewCandidate", back_populates="answers")


class InterviewResult(Base):
    __tablename__ = "interview_results"

    id = Column(Integer, primary_key=True, index=True)
    interview_candidate_id = Column(Integer, ForeignKey("interview_candidates.id"), unique=True, nullable=False)
    verbal_score = Column(Float, nullable=True)
    mcq_score = Column(Float, nullable=True)
    coding_score = Column(Float, nullable=True)
    final_score = Column(Float, nullable=True)
    tab_switches = Column(Integer, default=0)
    video_path = Column(String(500), nullable=True)
    evaluated_at = Column(DateTime, nullable=True)

    candidate = relationship("InterviewCandidate", back_populates="result")