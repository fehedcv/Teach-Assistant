from pydantic import BaseModel
from typing import Optional, Dict, List, Any


class ExamGenerateRequest(BaseModel):
    topic: str
    syllabus: Optional[str] = None
    counts: Dict[str, int]   # {"mcq": int, "one_mark": int, "three_mark": int}
    difficulty: Optional[str] = None  # "easy" | "medium" | "hard"

class ExamGenerateResponse(BaseModel):
    exam_id: int
    preview_questions: List[Any]

class Answer(BaseModel):
    question_id: int
    response: str

class ExamSubmitRequest(BaseModel):
    session_token: str
    student_id: int
    answers: List[Answer]

class ExamSubmitResponse(BaseModel):
    submission_id: int
    partial_grades: Optional[List[dict]] = None
    status: str
    
class ExamGradeRequest(BaseModel):
    submission_id: int

class ExamGradeResponse(BaseModel):
    submission_id: int
    total_marks: int
    graded: bool
    details: Optional[List[dict]] = None
    
class ExamResultDetail(BaseModel):
    student_id: int
    question_id: int
    response: str
    marks_obtained: int

class ExamResultsResponse(BaseModel):
    exam_id: int
    results: List[ExamResultDetail]
    
    
class ExamPublishResponse(BaseModel):
    exam_id: int
    status: str
    link: Optional[str] = None

class ExamDownloadResponse(BaseModel):
    exam_id: int
    format: str
    content: str   # HTML or plain text template

class ExamStartResponse(BaseModel):
    exam_id: int
    session_token: str
    link: str