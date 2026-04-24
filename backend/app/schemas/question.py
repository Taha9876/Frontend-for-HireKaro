from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.job import QuestionType, DifficultyLevel

class QuestionCreate(BaseModel):
    question_text: str
    question_type: QuestionType = QuestionType.verbal
    difficulty: DifficultyLevel = DifficultyLevel.medium

class QuestionResponse(BaseModel):
    id: int
    job_id: int
    question_text: str
    question_type: QuestionType
    difficulty: DifficultyLevel
    ai_generated: bool
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True