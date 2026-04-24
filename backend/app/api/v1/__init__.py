from fastapi import APIRouter
from app.api.v1 import auth, jobs, resumes, questions, screening, interviews

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(jobs.router)
router.include_router(resumes.router)
router.include_router(questions.router)
router.include_router(screening.router)
router.include_router(interviews.router)