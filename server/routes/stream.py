from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
import random
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from utils.ml_model import IntentClassifier
from utils.sentiment import analyze_sentiment
from utils.embeddings import EmbeddingStore
from utils.gemini_client import GeminiClient
from utils.database import log_conversation

router = APIRouter()

intent_classifier = IntentClassifier()
embedding_store = EmbeddingStore()
gemini_client = None

try:
    intent_classifier.load()
    embedding_store.load()
    gemini_client = GeminiClient()
except:
    pass

class StreamRequest(BaseModel):
    message: str
    session_id: str = "default"

async def generate_stream(message: str, session_id: str):
    try:
        intent_result = intent_classifier.predict(message)
        sentiment_result = analyze_sentiment(message)
        
        intent = intent_result['intent']
        confidence = intent_result['confidence']
        sentiment = sentiment_result['sentiment']
        
        if confidence >= 0.85 and intent in ['greeting', 'goodbye', 'thanks']:
            response = random.choice(intent_result['responses'])
            response_type = "ml_local"
        else:
            if gemini_client:
                try:
                    context_docs = embedding_store.search(message, top_k=3)
                    context = "\\n\\n".join(context_docs) if context_docs else ""
                    response = gemini_client.generate_response(message, context)
                    response_type = "llm_gemini"
                except:
                    response = random.choice(intent_result['responses']) if intent_result['responses'] else "I'm having trouble right now."
                    response_type = "ml_fallback"
            else:
                response = random.choice(intent_result['responses']) if intent_result['responses'] else "Please configure Gemini API."
                response_type = "ml_local"
        
        response = response.replace("PratChat", "Prat.AI").replace("pratchat", "Prat.AI").replace("Pratchat", "Prat.AI")
        
        # Stream response word by word
        words = response.split()
        streamed_response = ""
        
        for i, word in enumerate(words):
            streamed_response += word + " "
            
            data = {
                "content": word + " ",
                "done": False,
                "metadata": {
                    "intent": intent,
                    "confidence": confidence,
                    "sentiment": sentiment,
                    "response_type": response_type
                }
            }
            
            yield f"data: {json.dumps(data)}\\n\\n"
            await asyncio.sleep(0.05)  # Typing effect delay
        
        # Final message
        final_data = {
            "content": "",
            "done": True,
            "metadata": {
                "intent": intent,
                "confidence": confidence,
                "sentiment": sentiment,
                "response_type": response_type
            }
        }
        
        yield f"data: {json.dumps(final_data)}\\n\\n"
        
        # Log conversation
        try:
            log_conversation(message, streamed_response.strip(), intent, confidence, sentiment, response_type, session_id)
        except:
            pass
            
    except Exception as e:
        error_data = {
            "content": "Sorry, I encountered an error.",
            "done": True,
            "error": str(e)
        }
        yield f"data: {json.dumps(error_data)}\\n\\n"

@router.post("/stream")
async def stream_chat(request: StreamRequest):
    return StreamingResponse(
        generate_stream(request.message, request.session_id),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )