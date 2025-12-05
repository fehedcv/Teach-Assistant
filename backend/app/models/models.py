from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    firebase_uid = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)


class Class(Base):
    __tablename__ = 'classes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey('users.id'), nullable=False)


class Exam(Base):
    __tablename__ = 'exams'
    id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, nullable=False)  # e.g., 'scheduled', 'completed'


class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    exam_id = Column(Integer, ForeignKey('exams.id'), nullable=False)
    content = Column(String, nullable=False)
    question_type = Column(String, nullable=False)  # e.g., 'multiple_choice', 'short_answer'
    marks = Column(Integer, nullable=False)
    options = Column(JSONB)  # For multiple choice questions
    answer = Column(String)  # For short answer questions


class StudentResponse(Base):
    __tablename__ = 'student_responses'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    exam_id = Column(Integer, ForeignKey('exams.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    response = Column(String, nullable=False)
    marks_obtained = Column(Integer)


class LessonPlan(Base):
    __tablename__ = 'lesson_plans'
    id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    topic = Column(String, nullable=False)
    duration_hours = Column(Integer, nullable=False)
    plan = Column(JSONB, nullable=False)


class Announcement(Base):
    __tablename__ = 'announcements'
    id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
