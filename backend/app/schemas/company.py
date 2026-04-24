from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class CompanySignup(BaseModel):
    company_name: str
    email: EmailStr
    password: str
    industry: Optional[str] = None
    company_size: Optional[str] = None

class CompanyLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    company_name: str = ""

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class CompanyResponse(BaseModel):
    id: int
    company_name: str
    email: str
    industry: Optional[str]
    company_size: Optional[str]
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True