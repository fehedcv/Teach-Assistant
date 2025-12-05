from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Announcement
from app.schemas.announce import (
    AnnounceGenerateRequest,
    AnnounceGenerateResponse,
    AnnounceSendRequest,
    AnnounceSendResponse,
)
import urllib.parse

router = APIRouter(prefix="/api/v1/announce", tags=["announce"])

@router.post("/generate", response_model=AnnounceGenerateResponse)
def generate_announcement(payload: AnnounceGenerateRequest, db: Session = Depends(get_db)):
    formal_text = payload.raw_text.strip().capitalize()
    preview = formal_text[:50] + "..." if len(formal_text) > 50 else formal_text

    new_announcement = Announcement(
        teacher_id=1,  # TODO: replace with auth user
        class_id=1,    # TODO: replace with actual class
        title="Generated Announcement",
        content=formal_text
    )
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)

    return {
        "announcement_id": new_announcement.id,   # <-- include ID here
        "formal_text": formal_text,
        "preview": preview,
        "channels": ["whatsapp", "email", "sms"]
    }


# 2. Send announcement
@router.post("/send", response_model=AnnounceSendResponse)
def send_announcement(payload: AnnounceSendRequest, db: Session = Depends(get_db)):
    announcement = db.query(Announcement).filter(Announcement.id == payload.announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    link = None
    if payload.channel == "whatsapp":
        text = announcement.content
        encoded_text = urllib.parse.quote(text)

        # WhatsApp expects one recipient per link
        recipient = payload.recipients[0].replace("+", "").replace(" ", "")
        link = f"https://wa.me/{recipient}?text={encoded_text}"

    return AnnounceSendResponse(
        announcement_id=announcement.id,
        channel=payload.channel,
        recipients=payload.recipients,
        link=link,
        status="sent"
    )
