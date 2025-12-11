from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import *
from app.schemas.exams import *
from app.models.models import Student
import uuid

from app.schemas.marks import ExamStatsResponse, MarksResponse, MarksSummaryResponse

router = APIRouter(prefix="/api/v1/exams", tags=["exams"])

@router.post("/generate", response_model=ExamGenerateResponse)
def generate_exam(payload: ExamGenerateRequest, db: Session = Depends(get_db)):
    # 1. Create exam record
    new_exam = Exam(
        teacher_id=1,  # TODO: replace with auth user
        class_id=1,    # TODO: replace with actual class
        title=payload.topic,
        description=payload.syllabus,
        status="scheduled"
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)

    # 2. Generate dummy preview questions
    preview_questions = []
    if payload.counts.get("mcq", 0) > 0:
        preview_questions.append({
            "type": "MCQ",
            "content": f"What is 2+2 in {payload.topic}?",
            "options": ["3", "4", "5"],
            "answer": "4"
        })
    if payload.counts.get("one_mark", 0) > 0:
        preview_questions.append({
            "type": "one_mark",
            "content": f"Define a key term in {payload.topic}.",
            "answer": "Definition..."
        })
    if payload.counts.get("three_mark", 0) > 0:
        preview_questions.append({
            "type": "three_mark",
            "content": f"Explain a concept in {payload.topic}.",
            "answer": "Explanation..."
        })

    return ExamGenerateResponse(
        exam_id=new_exam.id,
        preview_questions=preview_questions
    )



@router.post("/{exam_id}/submit", response_model=ExamSubmitResponse)
def submit_exam(exam_id: int, payload: ExamSubmitRequest, db: Session = Depends(get_db)):
    partial_grades = []
    submission_id = None

    for ans in payload.answers:
        # Fetch the question to grade
        question = db.query(Question).filter(
            Question.id == ans.question_id,
            Question.exam_id == exam_id
        ).first()

        if not question:
            raise HTTPException(status_code=404, detail=f"Question {ans.question_id} not found")

        # Simple grading logic
        marks_obtained = 0
        if question.question_type == "multiple_choice":
            if ans.response.strip().lower() == question.answer.strip().lower():
                marks_obtained = question.marks
        elif question.question_type == "short_answer":
            if ans.response.strip().lower() == question.answer.strip().lower():
                marks_obtained = question.marks
        # (extend with fuzzy matching, partial credit, etc.)

        # Save student response
        submission = StudentResponse(
            student_id=payload.student_id,
            exam_id=exam_id,
            question_id=ans.question_id,
            response=ans.response,
            marks_obtained=marks_obtained
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)

        submission_id = submission.id
        partial_grades.append({
            "question_id": ans.question_id,
            "marks_obtained": marks_obtained
        })

    return ExamSubmitResponse(
        submission_id=submission_id,
        partial_grades=partial_grades,
        status="received"
    )
    
@router.post("/{exam_id}/grade", response_model=ExamGradeResponse)
def grade_exam(exam_id: int, payload: ExamGradeRequest, db: Session = Depends(get_db)):
    responses = db.query(StudentResponse).filter(
        StudentResponse.exam_id == exam_id,
        StudentResponse.student_id == payload.student_id  # use student_id instead of submission_id
    ).all()

    if not responses:
        raise HTTPException(status_code=404, detail="Submission not found")

    total_marks = 0
    details = []

    for resp in responses:
        question = db.query(Question).filter(Question.id == resp.question_id).first()
        if not question:
            continue

        marks_obtained = 0
        if question.answer and resp.response.strip().lower() == question.answer.strip().lower():
            marks_obtained = question.marks

        resp.marks_obtained = marks_obtained
        db.add(resp)
        db.commit()
        db.refresh(resp)

        total_marks += marks_obtained
        details.append({
            "question_id": resp.question_id,
            "response": resp.response,
            "marks_obtained": marks_obtained
        })

    # 🔑 Insert or update Marks record
    marks_record = db.query(Marks).filter(
        Marks.exam_id == exam_id,
        Marks.student_id == payload.student_id
    ).first()

    if marks_record:
        marks_record.total_marks = total_marks
    else:
        marks_record = Marks(
            student_id=payload.student_id,
            exam_id=exam_id,
            total_marks=total_marks,
            max_marks=sum(q.marks for q in db.query(Question).filter(Question.exam_id == exam_id).all())
        )
        db.add(marks_record)

    db.commit()
    db.refresh(marks_record)

    return ExamGradeResponse(
        submission_id=payload.submission_id,
        total_marks=total_marks,
        graded=True,
        details=details
    )

    
@router.get("/{exam_id}/student/{student_id}", response_model=MarksSummaryResponse)
def get_exam_results(exam_id: int, student_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(Marks)
        .filter(Marks.exam_id == exam_id, Marks.student_id == student_id)
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="No results found for this exam/student")

    # Extract only the fields you want from results JSON
    filtered_results = [
        {
            "feedback": r.get("feedback"),
            "correct_answer": r.get("correct_answer"),
            "student_answer": r.get("student_answer"),
            "is_correct": r.get("is_correct"),
        }
        for r in record.results
    ]

    return {
        "total_marks": record.total_marks,
        "results": filtered_results
    }



# 2. Download exam (HTML template)
@router.get("/{exam_id}/download", response_model=ExamDownloadResponse)
def download_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # For now, return a simple HTML template string
    html_template = f"""
    <html>
      <head><title>{exam.title}</title></head>
      <body>
        <h1>{exam.title}</h1>
        <p>{exam.description or ''}</p>
        <p>Status: {exam.status}</p>
      </body>
    </html>
    """

    return ExamDownloadResponse(
        exam_id=exam.id,
        format="html",
        content=html_template
    )


# 3. Start exam session
@router.post("/{exam_id}/start", response_model=ExamStartResponse)
def start_exam_session(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.status != "published":
        raise HTTPException(status_code=400, detail="Exam must be published before starting")

    session_token = str(uuid.uuid4())
    link = f"https://teach-assistant.com/exams/{exam_id}/session/{session_token}"

    return ExamStartResponse(
        exam_id=exam.id,
        session_token=session_token,
        link=link
    )
    
@router.get("/{exam_id}/stats", response_model=ExamStatsResponse)
def get_exam_stats(exam_id: int, db: Session = Depends(get_db)):
    records = db.query(Marks).filter(Marks.exam_id == exam_id).all()

    if not records:
        raise HTTPException(status_code=404, detail="No students attended this exam")

    stats = []
    for rec in records:
        student = db.query(User).filter(User.id == rec.student_id).first()
        student_name = student.name if student else f"Student {rec.student_id}"

        stats.append({
            "student_id": rec.student_id,
            "name": student_name,
            "total_marks": rec.total_marks,
            "max_marks": rec.max_marks
        })

    return {
        "exam_id": exam_id,
        "stats": stats
    }
