from fastapi import APIRouter, Query
from pydantic import BaseModel
import os
import sys
from pathlib import Path
from typing import List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from utils.database import get_chat_history

router = APIRouter()

class HistoryResponse(BaseModel):
    id: int
    user_message: str
    bot_response: str
    intent: Optional[str]
    confidence: Optional[float]
    sentiment: Optional[str]
    response_type: Optional[str]
    timestamp: str

@router.get("/history", response_model=List[HistoryResponse])
async def get_history(
    session_id: str = Query(default="default"),
    limit: int = Query(default=50, le=100)
):
    try:
        history = get_chat_history(session_id, limit)
        return history
    except Exception as e:
        print(f"History error: {e}")
        return []