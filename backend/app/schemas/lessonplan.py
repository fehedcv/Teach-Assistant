# app/schemas/lessonplan.py
from pydantic import BaseModel
from typing import Any

class LessonPlanCreate(BaseModel):
    teacher_id: int
    topic: str
    duration_hours: int
    plan: Any