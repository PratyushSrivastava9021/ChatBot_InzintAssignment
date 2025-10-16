from fastapi import APIRouter
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from utils.database import get_stats

router = APIRouter()

@router.get("/stats")
async def get_analytics():
    try:
        stats = get_stats()
        return {"status": "success", "data": stats}
    except Exception as e:
        return {"status": "error", "message": str(e)}
