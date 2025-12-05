from pydantic import BaseModel
from typing import List, Optional

class AnnounceGenerateRequest(BaseModel):
    raw_text: str
    tone: Optional[str] = "formal"  # default formal

class AnnounceGenerateResponse(BaseModel):
    announcement_id: int
    formal_text: str
    preview: str
    channels: List[str]


class AnnounceSendRequest(BaseModel):
    announcement_id: int
    channel: str  # e.g., "whatsapp"
    recipients: List[str]

class AnnounceSendResponse(BaseModel):
    announcement_id: int
    channel: str
    recipients: List[str]
    link: Optional[str] = None
    status: str
