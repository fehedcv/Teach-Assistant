from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any

class QuestionBase(BaseModel):
    exam_id: int
    mcq: Optional[List[Dict]] = None        # list of MCQs
    one_mark: Optional[List[Dict]] = None   # list of one-mark questions
    three_mark: Optional[List[Dict]] = None # list of three-mark questions

    # This validator fixes the error by converting a single dict to a list automatically
    @validator('mcq', 'one_mark', 'three_mark', pre=True)
    def ensure_list(cls, v: Any) -> Optional[List[Dict]]:
        if v is None:
            return None
        if isinstance(v, dict):
            return [v]
        return v

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: int

    class Config:
        orm_mode = True