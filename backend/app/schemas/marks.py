from pydantic import BaseModel
from typing import List, Dict



class ExamStatsDetail(BaseModel):
    student_id: int
    name: str
    total_marks: float
    max_marks: int

class ExamStatsResponse(BaseModel):
    exam_id: int
    stats: List[ExamStatsDetail]

class ResultDetail(BaseModel):
    index: int
    score: float
    feedback: str
    question: str
    max_marks: int
    is_correct: bool
    correct_answer: str
    student_answer: str

class MarksResponse(BaseModel):
    id: int
    student_id: int
    exam_id: int
    total_marks: float
    max_marks: int
    results: List[ResultDetail]

class ResultSummary(BaseModel):
    feedback: str
    correct_answer: str
    student_answer: str
    is_correct: bool

class MarksSummaryResponse(BaseModel):
    total_marks: float
    results: List[ResultSummary]

    class Config:
        orm_mode = True

