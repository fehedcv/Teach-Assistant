from typing import List, Any, Union, Dict
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

# --- ReportLab Imports ---
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth

# --- App Imports (Adjust paths as per your project structure) ---
# Assuming these exist based on your snippet
from app.db.session import get_db
from app.models.models import Question, Exam
from app.schemas.questions import QuestionCreate, QuestionResponse

router = APIRouter(prefix="/api/v1/questions", tags=["questions"])

@router.post("/", response_model=QuestionResponse)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)):
    new_question = Question(
        exam_id=payload.exam_id,
        mcq=payload.mcq,
        one_mark=payload.one_mark,
        three_mark=payload.three_mark
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question

@router.get("/exam/{exam_id}", response_model=List[QuestionResponse])
def get_questions_for_exam(exam_id: int, db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.exam_id == exam_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this exam")
    return questions

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@router.get("/exam/{exam_id}/pdf")
def export_exam_to_pdf(exam_id: int, db: Session = Depends(get_db)):
    """
    Generates a structured Exam PDF with dynamic total marks calculation.
    """
    # Fetch Questions
    questions = db.query(Question).filter(Question.exam_id == exam_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this exam")

    # Fetch Exam Title
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam_title = exam.title if exam.title else f"Subject ID {exam_id}"

    # --- 1. Pre-process Data & Calculate Marks ---
    
    def normalize_to_list(data: Union[Dict, List, None]) -> List[Any]:
        """Safely converts single dicts or None into a list for iteration."""
        if not data:
            return []
        if isinstance(data, dict):
            return [data] if data else []
        return data

    all_mcqs = []
    all_short_questions = []  # Formerly 'one_mark'
    all_long_questions = []   # Formerly 'three_mark'

    for q in questions:
        all_mcqs.extend(normalize_to_list(q.mcq))
        all_short_questions.extend(normalize_to_list(q.one_mark))
        all_long_questions.extend(normalize_to_list(q.three_mark))

    # Calculate Total Marks based on user logic
    # MCQ = 1 mark, Short (one_mark) = 3 marks, Long (three_mark) = 7 marks
    total_marks = (len(all_mcqs) * 1) + (len(all_short_questions) * 3) + (len(all_long_questions) * 7)

    # --- 2. PDF Generation Setup ---

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Layout Constants
    MARGIN_X = inch * 0.75
    MARGIN_Y = inch * 0.75
    CONTENT_WIDTH = width - (2 * MARGIN_X)
    FONT_STD = "Helvetica"
    FONT_BOLD = "Helvetica-Bold"
    FONT_SIZE = 11
    LINE_HEIGHT = 14

    def draw_border():
        """Draws the outline box on the current page."""
        p.setLineWidth(1)
        p.rect(MARGIN_X, MARGIN_Y, CONTENT_WIDTH, height - (2 * MARGIN_Y))

    def check_page_break(y_pos, required_space=50):
        """Checks if we need a new page. Returns new Y position."""
        if y_pos < MARGIN_Y + required_space:
            p.showPage()
            draw_border()
            p.setFont(FONT_STD, 9)
            p.drawRightString(width - MARGIN_X - 10, height - MARGIN_Y - 15, "(Page Cont.)")
            p.setFont(FONT_STD, FONT_SIZE)
            return height - MARGIN_Y - 30
        return y_pos

    def draw_wrapped_text(text, x, y, max_w, font=FONT_STD, size=FONT_SIZE, line_height=None):
        """Wraps text to fit within max_w and updates Y position."""
        lh = line_height if line_height else LINE_HEIGHT
        p.setFont(font, size)
        words = text.split()
        line = ""
        for word in words:
            if stringWidth(line + " " + word, font, size) < max_w:
                line += " " + word
            else:
                p.drawString(x, y, line.strip())
                y -= lh
                y = check_page_break(y)
                line = word
        if line:
            p.drawString(x, y, line.strip())
            y -= lh
        return check_page_break(y, 10)

    def draw_header(current_y, calculated_marks):
        """Draws the exam header with the dynamic total marks."""
        # Top Left: Code
        p.setFont(FONT_STD, 10)
        p.drawString(MARGIN_X + 10, current_y, f"TED (21)-1001 (Rev. 2021)")
        
        # Top Right: Reg No
        p.drawRightString(width - MARGIN_X - 10, current_y, "Reg. No. _______________")
        current_y -= 15
        p.drawRightString(width - MARGIN_X - 10, current_y, "Signature _______________")
        
        current_y -= 20
        
        # Centered Titles
        p.setFont(FONT_BOLD, 14)
        p.drawCentredString(width / 2, current_y, "DIPLOMA EXAMINATION IN ENGINEERING/TECHNOLOGY")
        current_y -= 20
        p.setFont(FONT_BOLD, 16)
        p.drawCentredString(width / 2, current_y, f"EXAM PAPER - {exam_title.upper()}")
        current_y -= 20
        
        # Meta Info (Time / Marks)
        p.setFont(FONT_STD, 10)
        p.drawString(MARGIN_X + 10, current_y, "[Time: 3 Hours]")
        # Dynamic Marks Display
        p.drawRightString(width - MARGIN_X - 10, current_y, f"(Maximum Marks: {calculated_marks})")
        
        # Separator Line
        current_y -= 10
        p.setLineWidth(0.5)
        p.line(MARGIN_X, current_y, width - MARGIN_X, current_y)
        current_y -= 20
        
        return current_y

    # --- 3. Start Drawing ---
    
    draw_border()
    y = height - MARGIN_Y - 20
    # Pass total_marks to header
    y = draw_header(y, total_marks)

    # --- PART A: MCQ (1 Mark) ---
    if all_mcqs:
        p.setFont(FONT_BOLD, 12)
        p.drawCentredString(width / 2, y, "PART - A")
        y -= 20
        p.setFont(FONT_STD, 10)
        y = draw_wrapped_text("I. Answer all the following questions. (1 Mark each)", MARGIN_X + 10, y, CONTENT_WIDTH)
        y -= 10
        
        for i, mcq in enumerate(all_mcqs):
            text = mcq.get("question", "") if isinstance(mcq, dict) else str(mcq)
            y = draw_wrapped_text(f"{i+1}. {text}", MARGIN_X + 20, y, CONTENT_WIDTH - 30)
            
            if isinstance(mcq, dict):
                options = mcq.get("options", [])
                opt_str = "    ".join(options)
                # Check if options fit on one line
                if stringWidth(opt_str, FONT_STD, 10) < (CONTENT_WIDTH - 40):
                     y = draw_wrapped_text(opt_str, MARGIN_X + 40, y, CONTENT_WIDTH - 50, size=10)
                else:
                    for opt in options:
                        y = draw_wrapped_text(f"- {opt}", MARGIN_X + 40, y, CONTENT_WIDTH - 50, size=10)
            y -= 5
        y -= 15

    # --- PART B: Short Questions (3 Marks) ---
    if all_short_questions:
        y = check_page_break(y, 60)
        p.setFont(FONT_BOLD, 12)
        p.drawCentredString(width / 2, y, "PART - B")
        y -= 20
        p.setFont(FONT_STD, 10)
        # Updated text for 3 marks
        y = draw_wrapped_text("II. Answer the following questions. (3 Marks each)", MARGIN_X + 10, y, CONTENT_WIDTH)
        y -= 10
        
        for i, om in enumerate(all_short_questions):
            text = om.get("question", "") if isinstance(om, dict) else str(om)
            y = draw_wrapped_text(f"{i+1}. {text}", MARGIN_X + 20, y, CONTENT_WIDTH - 30)
            y -= 10
        y -= 15

    # --- PART C: Long Questions (7 Marks) ---
    if all_long_questions:
        y = check_page_break(y, 60)
        p.setFont(FONT_BOLD, 12)
        p.drawCentredString(width / 2, y, "PART - C")
        y -= 20
        p.setFont(FONT_STD, 10)
        # Updated text for 7 marks
        y = draw_wrapped_text("III. Answer the following questions in detail. (7 Marks each)", MARGIN_X + 10, y, CONTENT_WIDTH)
        y -= 10
        
        for i, tm in enumerate(all_long_questions):
            text = tm.get("question", "") if isinstance(tm, dict) else str(tm)
            y = draw_wrapped_text(f"{i+1}. {text}", MARGIN_X + 20, y, CONTENT_WIDTH - 30)
            y -= 20

    p.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=exam_{exam_id}.pdf"}
    )