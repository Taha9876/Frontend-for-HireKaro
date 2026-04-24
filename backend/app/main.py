from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import router as api_router
import app.models.company
import app.models.job
import app.models.interview
from fastapi.staticfiles import StaticFiles
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

# CORS — local + production dono
origins = [
    "http://localhost:3000",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads folder serve karo
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "Brain_A_Hire API is running"}