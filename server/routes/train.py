from fastapi import APIRouter
from pydantic import BaseModel
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from utils.ml_model import IntentClassifier
from utils.embeddings import EmbeddingStore

router = APIRouter()

class TrainResponse(BaseModel):
    status: str
    message: str
    details: dict

@router.post("/train", response_model=TrainResponse)
async def train_model():
    try:
        classifier = IntentClassifier()
        result = classifier.train()
        classifier.save()
        
        return TrainResponse(
            status="success",
            message="Intent classifier trained successfully",
            details=result
        )
    except Exception as e:
        return TrainResponse(
            status="error",
            message=str(e),
            details={}
        )

@router.post("/embed", response_model=TrainResponse)
async def build_embeddings():
    try:
        store = EmbeddingStore()
        result = store.build_index()
        store.save()
        
        return TrainResponse(
            status="success",
            message="Embeddings built successfully",
            details=result
        )
    except Exception as e:
        return TrainResponse(
            status="error",
            message=str(e),
            details={}
        )
