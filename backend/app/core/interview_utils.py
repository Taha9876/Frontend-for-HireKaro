import random
import string
from datetime import datetime, date, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def calculate_duration(questions: list) -> int:
    """Questions se interview duration calculate karo"""
    verbal_count = sum(1 for q in questions if q.question_type.value == "verbal")
    coding_count = sum(1 for q in questions if q.question_type.value == "coding")
    mcq_count = sum(1 for q in questions if q.question_type.value == "mcq")

    total_minutes = (
        verbal_count * 2.5 +
        coding_count * 8.0 +
        mcq_count * 1.0
    )
    # 15% buffer
    total_with_buffer = total_minutes * 1.15

    # Round up to nearest 15 min, minimum 15
    rounded = max(15, int((total_with_buffer + 14) // 15) * 15)
    return rounded


def generate_username(candidate_name: str, job_id: int) -> str:
    """Readable unique username generate karo"""
    # Name clean karo
    name_part = (candidate_name or "candidate").lower()
    name_part = ''.join(c for c in name_part if c.isalpha())
    name_part = name_part[:8] if len(name_part) > 8 else name_part

    # Random suffix
    suffix = ''.join(random.choices(string.digits, k=4))
    return f"{name_part}_{job_id}_{suffix}"


def generate_password(length: int = 8) -> str:
    """Strong readable password generate karo"""
    chars = string.ascii_letters + string.digits
    # At least 1 uppercase, 1 lowercase, 1 digit
    password = (
        random.choice(string.ascii_uppercase) +
        random.choice(string.ascii_lowercase) +
        random.choice(string.digits) +
        ''.join(random.choices(chars, k=length - 3))
    )
    return ''.join(random.sample(password, len(password)))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def is_interview_accessible(scheduled_date: date, start_time: str, duration_minutes: int) -> dict:
    """Check karo candidate interview access kar sakta hai ya nahi"""
    now = datetime.now()
    
    # Parse scheduled datetime
    time_parts = start_time.split(":")
    scheduled_dt = datetime(
        scheduled_date.year,
        scheduled_date.month,
        scheduled_date.day,
        int(time_parts[0]),
        int(time_parts[1])
    )
    
    end_dt = scheduled_dt + timedelta(minutes=duration_minutes)
    # 5 min early access allow karo
    access_start = scheduled_dt - timedelta(minutes=5)

    if now < access_start:
        return {
            "accessible": False,
            "reason": "not_started",
            "starts_at": scheduled_dt.isoformat(),
            "message": f"Interview starts at {start_time}. Please come back on time."
        }
    elif now > end_dt:
        return {
            "accessible": False,
            "reason": "expired",
            "message": "Interview time has ended."
        }
    else:
        return {
            "accessible": True,
            "reason": "active",
            "ends_at": end_dt.isoformat(),
            "remaining_minutes": int((end_dt - now).total_seconds() / 60)
        }