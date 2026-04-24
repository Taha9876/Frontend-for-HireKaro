from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=True)
    company_size = Column(String(50), nullable=True)
    logo_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    refresh_token = Column(Text, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    # Company class ke andar, baaki columns ke baad
    jobs = relationship("Job", back_populates="company")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())