from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.email import send_otp_email
from datetime import datetime, timedelta
import random, string

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, verify_token
)
from app.models.company import Company
from app.schemas.company import (
    CompanySignup, CompanyLogin, OTPVerify, ResendOTPRequest,
    TokenResponse, RefreshTokenRequest, CompanyResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

# ─── SIGNUP ───────────────────────────────────────────────
@router.post("/signup", status_code=201)
def signup(data: CompanySignup, db: Session = Depends(get_db)):
    # Email already exists check
    existing = db.query(Company).filter(Company.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    company = Company(
        company_name=data.company_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        industry=data.industry,
        company_size=data.company_size,
        otp_code=otp,
        otp_expires_at=otp_expiry,
        is_verified=False
    )
    db.add(company)
    db.commit()
    db.refresh(company)

    # TODO: Send OTP email (Phase 1 email setup mein)
    # print(f"OTP for {data.email}: {otp}")  # Dev mein terminal pe dikhega

    email_sent = send_otp_email(
    to_email=data.email,
    company_name=data.company_name,
    otp=otp
    )
    if not email_sent:
        print(f"Email failed, OTP: {otp}")  # Fallback — dev ke liye

    return {"message": "Signup successful. Check email for OTP.", "email": data.email}

# ─── VERIFY OTP ───────────────────────────────────────────
@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.email == data.email).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if company.is_verified:
        raise HTTPException(status_code=400, detail="Already verified")
    if company.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if datetime.utcnow() > company.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")

    company.is_verified = True
    company.otp_code = None
    company.otp_expires_at = None
    db.commit()

    return {"message": "Email verified successfully. You can now login."}

# ─── RESEND OTP ───────────────────────────────────────────
@router.post("/resend-otp")
def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.email == data.email).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if company.is_verified:
        raise HTTPException(status_code=400, detail="Already verified")

    otp = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    company.otp_code = otp
    company.otp_expires_at = otp_expiry
    db.commit()

    email_sent = send_otp_email(
        to_email=company.email,
        company_name=company.company_name,
        otp=otp
    )
    if not email_sent:
        print(f"Email failed, OTP: {otp}")

    return {"message": "OTP resent. Check your email."}

# ─── LOGIN ────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(data: CompanyLogin, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.email == data.email).first()

    # Account lockout check
    if company and company.locked_until:
        if datetime.utcnow() < company.locked_until:
            raise HTTPException(status_code=423, detail="Account locked. Try after 15 minutes.")
        else:
            company.locked_until = None
            company.failed_login_attempts = 0

    if not company or not verify_password(data.password, company.hashed_password):
        if company:
            company.failed_login_attempts += 1
            if company.failed_login_attempts >= 5:
                company.locked_until = datetime.utcnow() + timedelta(minutes=15)
            db.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not company.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    # Reset failed attempts
    company.failed_login_attempts = 0

    access_token = create_access_token({"sub": str(company.id), "email": company.email})
    refresh_token = create_refresh_token({"sub": str(company.id), "email": company.email})

    company.refresh_token = refresh_token
    db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token,company_name=company.company_name)

# ─── REFRESH TOKEN ────────────────────────────────────────
@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = verify_token(data.refresh_token, "refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    company = db.query(Company).filter(Company.id == int(payload["sub"])).first()
    if not company or company.refresh_token != data.refresh_token:
        raise HTTPException(status_code=401, detail="Token mismatch")

    new_access = create_access_token({"sub": str(company.id), "email": company.email})
    new_refresh = create_refresh_token({"sub": str(company.id), "email": company.email})

    company.refresh_token = new_refresh
    db.commit()

    return TokenResponse(access_token=new_access, refresh_token=new_refresh)

# ─── LOGOUT ───────────────────────────────────────────────
@router.post("/logout")
def logout(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = verify_token(data.refresh_token, "refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    company = db.query(Company).filter(Company.id == int(payload["sub"])).first()
    if company:
        company.refresh_token = None
        db.commit()

    return {"message": "Logged out successfully"}

# ─── ME (Protected Route Example) ────────────────────────
@router.get("/me", response_model=CompanyResponse)
def get_me(token: str, db: Session = Depends(get_db)):
    payload = verify_token(token, "access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    company = db.query(Company).filter(Company.id == int(payload["sub"])).first()
    if not company:
        raise HTTPException(status_code=404, detail="Not found")

    return company