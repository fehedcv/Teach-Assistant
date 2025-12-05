import uvicorn
from dotenv import load_dotenv

load_dotenv()
import os
from app.models import models
#from app.core import firebase
# Load environment variables from .env file

# Check for Firebase service account JSON
'''if not os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON"):
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set. Please create a .env file and add the required environment variables.")
'''

from fastapi import FastAPI,HTTPException,APIRouter
import logging
from sqlalchemy.exc import OperationalError
#from app.db.base import Base
from app.db.base import Base
from app.db.session import engine
#from app.api.v2 import router
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import get_db
from app.models import models
from fastapi import Depends,APIRouter
from sqlalchemy.orm import Session
from app.models.models import LessonPlan
from app.schemas.lessonplan import *
from app.api.v1 import exams
from app.api.v1 import announce






app = FastAPI(title="Teach-Assist", version="0.1.0")
security = HTTPBearer()
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

origins = [
    "http://localhost:8081",
    "http://localhost:5173",      # Vite local dev default
    "http://127.0.0.1:5173",      # Alternative local dev
    "http://192.168.1.5:5173",    # IF you access your frontend via network IP (example)
]

# 2. Add the Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # List of allowed origins
    allow_credentials=True,       # REQUIRED for cookies/auth
    allow_methods=["*"],          # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],          # Allow all headers
)
app.include_router(exams.router)
app.include_router(announce.router)


@app.on_event("startup")
def on_startup():
    create_tables(engine)

def create_tables(engine):
    try:
        logger.info("Attempting to create tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Tables created successfully.")
    except OperationalError as e:
        logger.error("Could not connect to the database. Please check your connection details and ensure the database exists.")
        logger.error(f"Error details: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to Teach-Assistant API"}


@app.get("/lessonplan/{lessonplan_id}")
def get_lessonplan(lessonplan_id: int, db: Session = Depends(get_db)):
    lessonplan = db.query(models.LessonPlan).filter(models.LessonPlan.id == lessonplan_id).first()
    if not lessonplan:
        raise HTTPException(status_code=404, detail="Lesson plan not found")
    return lessonplan

@app.post("/lessonplan/generate")
def create_lessonplan(payload: LessonPlanCreate, db: Session = Depends(get_db)):
    new_plan = LessonPlan(
        teacher_id=payload.teacher_id,
        topic=payload.topic,
        duration_hours=payload.duration_hours,
        plan=payload.plan
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan


if __name__ == "__main__":
    create_tables(engine)
    uvicorn.run(app, host="0.0.0.0", port=8000)