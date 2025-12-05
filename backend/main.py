import json
import uuid
import time
import random
import httpx
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import uvicorn

load_dotenv()

# --- Configuration ---
# NOTE: In a real application, replace this mock API key with a secured environment variable.
API_KEY = os.getenv("API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent"
MODEL_NAME = "gemini-2.5-flash-preview-09-2025"

# --- In-Memory Databases (for demonstration) ---
# Stores generated exams and their structure
exams_db: Dict[str, Any] = {}
# Stores student submission results
results_db: Dict[str, Dict[str, Any]] = {}


# --- Pydantic Models for Data Validation ---

class QuestionStructure(BaseModel):
    """Defines the structure for a specific type of question."""
    question_type: str = Field(..., description="e.g., MCQ, ShortAnswer")
    points: int = Field(..., description="Points awarded for this question type")
    count: int = Field(..., description="Number of questions of this type")

class ExamStructureInput(BaseModel):
    """Input model for generating a new exam."""
    topic: str = Field(..., description="The main topic or chapter for the exam.")
    grade_level: str = Field("University", description="The target grade level for complexity.")
    structure: List[QuestionStructure] = Field(..., description="List defining the composition of the exam.")
    
class Question(BaseModel):
    """Represents a single generated question."""
    question_id: str
    question_type: str
    points: int
    text: str
    # Options are only for MCQ
    options: Optional[Dict[str, str]] = None
    # For short answers, the expected answer/rubric is stored here (hidden from students)
    expected_answer_rubric: Optional[str] = None

class Exam(BaseModel):
    """Represents the complete generated exam."""
    exam_id: str
    topic: str
    total_marks: int
    generated_at: str
    questions: List[Question]

class QuestionPublic(BaseModel):
    """Represents a single generated question, without the answer."""
    question_id: str
    question_type: str
    points: int
    text: str
    options: Optional[Dict[str, str]] = None

class ExamPublic(BaseModel):
    """Represents the complete generated exam, without the answers."""
    exam_id: str
    topic: str
    total_marks: int
    generated_at: str
    questions: List[QuestionPublic]

class SubmissionAnswer(BaseModel):
    """Represents a single answer from a student."""
    question_id: str
    # Answer can be a single choice (A, B, C, D) or text for short answers
    answer: str

class StudentSubmission(BaseModel):
    """Input model for a student submitting an exam."""
    student_id: str = Field(..., description="Unique identifier for the student.")
    exam_id: str = Field(..., description="The ID of the exam being submitted.")
    answers: List[SubmissionAnswer]

class GradedQuestion(BaseModel):
    """Represents the result for a single question."""
    question_id: str
    points_awarded: float
    max_points: int
    feedback: Optional[str] = None

class GradedResult(BaseModel):
    """Represents the final, graded result for a student."""
    exam_id: str
    student_id: str
    total_score: float
    max_score: int
    graded_at: str
    question_results: List[GradedQuestion]

# --- FastAPI App Initialization ---
app = FastAPI(
    title="AI Exam Generator & Conductor",
    description="A backend service for generating standardized exams and grading student submissions using an LLM.",
)

# --- LLM Helper Functions ---

async def call_gemini_api(payload: Dict[str, Any]) -> str:
    """Simulates an asynchronous call to the Gemini API with exponential backoff."""
    if not API_KEY:
        # Mock LLM response for development when API_KEY is missing
        print("MOCK API CALL: Returning generic placeholder content.")
        
        # Determine the number of questions requested in the user query for mock generation
        user_query = payload["contents"][0]["parts"][0]["text"]
        num_questions = 2 # Default mock count
        try:
            # Simple attempt to extract total number of questions from the query text
            import re
            match = re.search(r'Generate a total of (\d+) questions', user_query)
            if match:
                num_questions = int(match.group(1))
        except:
            pass # Keep default if parsing fails

        if payload.get("systemInstruction", {}).get("parts", [{}])[0].get("text", "").startswith("Generate a JSON array of"):
             # Mock structured generation for questions
             mock_questions = []
             for i in range(num_questions):
                 is_mcq = i % 2 == 0
                 
                 if is_mcq:
                     mock_questions.append({
                         "question_type": "MCQ",
                         "points": 1,
                         "text": f"MCQ Placeholder Question {i+1} on the topic.",
                         "options": {"A": "Option A", "B": "Option B", "C": "Correct Mock Answer", "D": "Option D"},
                         "expected_answer_rubric": "C"
                     })
                 else:
                     mock_questions.append({
                         "question_type": "ShortAnswer",
                         "points": 3,
                         "text": f"Short Answer Placeholder Question {i+1} requiring explanation.",
                         "options": None,
                         "expected_answer_rubric": "The answer should describe the core concept accurately to achieve full marks."
                     })

             return json.dumps(mock_questions)
        else:
            # Mock unstructured grading response
            max_points = 3 # Assumed max points for short answer grading prompt
            score = random.uniform(0.0, max_points)
            return json.dumps({"score": round(score, 2), "feedback": "Mock feedback: The response partially addressed the prompt but lacked depth."})

    max_retries = 3
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{GEMINI_API_URL}?key={API_KEY}", 
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                # Use sources if available, otherwise fallback to text
                return result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        except httpx.RequestError as e:
            if attempt < max_retries - 1:
                # Exponential backoff
                sleep_time = 2 ** attempt
                # print(f"API request failed, retrying in {sleep_time}s... Error: {e}")
                time.sleep(sleep_time)
            else:
                raise HTTPException(status_code=500, detail=f"LLM API failed after {max_retries} attempts: {e}")
    return "" # Should not be reached

async def generate_question_paper(input_data: ExamStructureInput) -> List[Dict[str, Any]]:
    """Generates questions using the Gemini API based on the exam structure."""
    
    # Construct a detailed prompt for the LLM
    structure_details = "\n".join([
        f"- {s.count} question(s) of type '{s.question_type}' (worth {s.points} points each)"
        for s in input_data.structure
    ])
    
    total_requested = sum(s.count for s in input_data.structure)

    system_prompt = (
        "You are an expert test creator. Generate a set of exam questions based on the user's requirements. "
        "The output MUST be a valid JSON array of question objects, containing exactly "
        f"{total_requested} questions in total. "
        "The JSON schema must match the following structure: "
        '[{ "question_type": "MCQ" or "ShortAnswer", "points": int, "text": "...", "options": {"A": "...", "B": "...", ...} or null, "expected_answer_rubric": "..." }]'
        "For ShortAnswer questions, the 'expected_answer_rubric' should contain the model answer or grading criteria. "
        "For MCQ questions, the 'expected_answer_rubric' should contain the letter of the correct option (e.g., 'C')."
    )

    user_query = (
        f"Generate a total of {total_requested} questions on the topic: '{input_data.topic}'. "
        f"The questions should be appropriate for a '{input_data.grade_level}' level student. "
        f"The exam structure is as follows:\n{structure_details}"
    )

    payload = {
        "contents": [{"parts": [{"text": user_query}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "question_type": {"type": "STRING"},
                        "points": {"type": "INTEGER"},
                        "text": {"type": "STRING"},
                        "options": {"type": ["object", "null"]},
                        "expected_answer_rubric": {"type": "STRING"}
                    },
                    "required": ["question_type", "points", "text", "expected_answer_rubric"]
                }
            }
        },
    }

    raw_json_response = await call_gemini_api(payload)
    
    try:
        generated_questions = json.loads(raw_json_response)
        return generated_questions
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="LLM returned invalid JSON for question generation.")

async def grade_short_answer(question_text: str, student_answer: str, expected_rubric: str, max_points: int) -> Dict[str, Any]:
    """Grades a short answer using the Gemini API."""
    
    # System prompt to guide the grading persona and output format
    system_prompt = (
        f"You are an objective and fair academic grader. Grade the student's answer against the expected rubric. The maximum score for this question is {max_points} points. "
        "The output MUST be a valid JSON object with two keys: 'score' (a float between 0.0 and the maximum points) "
        "and 'feedback' (a concise explanation for the score)."
    )
    
    user_query = (
        f"Grade the following student response. The maximum score is {max_points} points.\n\n"
        f"Question: {question_text}\n"
        f"Expected Rubric/Answer: {expected_rubric}\n"
        f"Student Answer: {student_answer}"
    )
    
    payload = {
        "contents": [{"parts": [{"text": user_query}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "score": {"type": "NUMBER"},
                    "feedback": {"type": "STRING"}
                }
            }
        },
    }
    
    raw_json_response = await call_gemini_api(payload)
    
    try:
        result = json.loads(raw_json_response)
        # Ensure score is within valid range (safety check)
        score = max(0.0, min(max_points, float(result.get("score", 0.0))))
        return {"score": score, "feedback": result.get("feedback", "No specific feedback provided.")}
    except json.JSONDecodeError:
        print(f"Error decoding grading response: {raw_json_response}")
        return {"score": 0.0, "feedback": "Grading failed due to API error."}

# --- API Endpoints ---

@app.post("/exams/generate", response_model=ExamPublic)
async def generate_exam(input_data: ExamStructureInput):
    """
    Generates a new question paper based on the topic and structure.
    Simulates calling the LLM to generate content.
    """
    print(f"Generating exam for topic: {input_data.topic}")
    
    # 1. Generate questions using LLM (mocked via generate_question_paper)
    generated_content = await generate_question_paper(input_data)
    
    # 2. Map generated content to the final Question model
    final_questions: List[Question] = []
    total_marks = 0
    
    for q_data in generated_content:
        question_id = str(uuid.uuid4())
        points = q_data.get("points", 1) # Default to 1 if missing
        
        final_questions.append(Question(
            question_id=question_id,
            question_type=q_data["question_type"],
            points=points,
            text=q_data["text"],
            options=q_data.get("options"),
            expected_answer_rubric=q_data["expected_answer_rubric"]
        ))
        total_marks += points
        
    exam_id = str(uuid.uuid4())
    current_time = time.strftime("%Y-%m-%d %H:%M:%S UTC")

    # 3. Create the Exam object and store it
    new_exam = Exam(
        exam_id=exam_id,
        topic=input_data.topic,
        total_marks=total_marks,
        generated_at=current_time,
        questions=final_questions
    )
    
    # Store in DB (without sensitive data like rubrics, or store securely)
    # For this example, we store the full object, which includes rubrics/answers (sensitive)
    exams_db[exam_id] = new_exam.model_dump()
    
    # 4. Generate Output (Downloadable Paper and Online Link)
    # The downloadable PDF/HTML would be generated here using a template and returned.
    online_link = f"/exams/{exam_id}/submit"
    print(f"Exam '{exam_id}' generated successfully. Online link: {online_link}")

    # Create a safe copy of the exam to return (excluding the sensitive rubric data)
    public_questions = [
        QuestionPublic(**q.model_dump())
        for q in final_questions
    ]
    
    # You would typically return a JSON object with the exam ID, a download link, and the online link.
    # We return the public exam object here for simplicity.
    return ExamPublic(
        exam_id=exam_id,
        topic=input_data.topic,
        total_marks=total_marks,
        generated_at=current_time,
        questions=public_questions
    )


@app.post("/exams/{exam_id}/submit", response_model=GradedResult)
async def submit_exam(exam_id: str, submission: StudentSubmission):
    """
    Accepts student submission, grades it using AI/simple logic, and stores the results.
    """
    if exam_id not in exams_db:
        raise HTTPException(status_code=404, detail="Exam not found.")
    
    exam_data = Exam(**exams_db[exam_id])
    
    total_score = 0.0
    max_score = exam_data.total_marks
    graded_questions: List[GradedQuestion] = []
    
    # 1. Map submissions to questions
    answers_map = {ans.question_id: ans.answer for ans in submission.answers}
    
    # 2. Iterate through questions and grade
    for question in exam_data.questions:
        student_answer = answers_map.get(question.question_id)
        
        if student_answer is None:
            # Handle unattempted questions
            graded_questions.append(GradedQuestion(
                question_id=question.question_id,
                points_awarded=0.0,
                max_points=question.points,
                feedback="Question not attempted."
            ))
            continue
            
        points_awarded = 0.0
        feedback = ""
        
        if question.question_type.lower() == "mcq":
            # --- MCQ Grading (Straightforward) ---
            is_correct = (student_answer.upper() == question.expected_answer_rubric.upper())
            points_awarded = question.points if is_correct else 0.0
            feedback = "Correct Answer." if is_correct else f"Incorrect. The correct option was {question.expected_answer_rubric}."
            
        elif question.question_type.lower() == "shortanswer":
            # --- Short Answer Grading (AI/Rubric-based) ---
            
            # Call the LLM to grade the answer
            grading_result = await grade_short_answer(
                question_text=question.text,
                student_answer=student_answer,
                expected_rubric=question.expected_answer_rubric,
                max_points=question.points # Pass the actual max points
            )
            
            # The result is already safe-checked in grade_short_answer
            points_awarded = grading_result["score"]
            feedback = grading_result["feedback"]
            
        total_score += points_awarded
        graded_questions.append(GradedQuestion(
            question_id=question.question_id,
            points_awarded=points_awarded,
            max_points=question.points,
            feedback=feedback
        ))
        
    # 3. Compile the final result
    final_result = GradedResult(
        exam_id=exam_id,
        student_id=submission.student_id,
        total_score=round(total_score, 2),
        max_score=max_score,
        graded_at=time.strftime("%Y-%m-%d %H:%M:%S UTC"),
        question_results=graded_questions
    )
    
    # 4. Store the result in the DB (using the student_id as the key under the exam_id)
    if exam_id not in results_db:
        results_db[exam_id] = {}
        
    results_db[exam_id][submission.student_id] = final_result.model_dump()
    print(f"Submission from {submission.student_id} for exam {exam_id} graded and stored.")

    return final_result


@app.get("/exams/{exam_id}/results/{student_id}", response_model=GradedResult)
async def get_results(exam_id: str, student_id: str):
    """Retrieves the grading results for a specific student and exam."""
    
    if exam_id not in results_db:
        raise HTTPException(status_code=404, detail="Exam results not found.")
    
    if student_id not in results_db[exam_id]:
        raise HTTPException(status_code=404, detail=f"Result for student {student_id} not found in exam {exam_id}.")
        
    return results_db[exam_id][student_id]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
