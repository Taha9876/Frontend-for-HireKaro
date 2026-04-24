from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    APP_NAME: str = "Brain_A_Hire"
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    OPENAI_API_KEY: str = ""
    UPLOAD_DIR: str = "uploads"
    SHORTLIST_THRESHOLD: float = 0.55

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()