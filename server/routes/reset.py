from fastapi import APIRouter
from pydantic import BaseModel
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from utils.database import clear_conversation_history

router = APIRouter()

class ResetResponse(BaseModel):
    status: str
    message: str

@router.delete("/reset")
async def reset_conversation(session_id: str = "default"):
    try:
        cleared_count = clear_conversation_history(session_id)
        return ResetResponse(
            status="success",
            message=f"Cleared {cleared_count} conversations for session {session_id}"
        )
    except Exception as e:
        return ResetResponse(
            status="error",
            message=str(e)
        )