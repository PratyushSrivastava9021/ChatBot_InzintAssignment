from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
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
    print("[OK] Intent classifier loaded")
except Exception as e:
    print(f"[WARN] Loading failed, training new model: {e}")
    try:
        intent_classifier.train()
        intent_classifier.save()
        print("[OK] Intent classifier trained and saved")
    except Exception as train_error:
        print(f"[ERROR] Training failed: {train_error}")

try:
    embedding_store.load()
    print("[OK] Embedding store loaded")
except Exception as e:
    print(f"[WARN] Loading failed, building index: {e}")
    try:
        embedding_store.build_index()
        embedding_store.save()
        print("[OK] Embedding store built and saved")
    except Exception as build_error:
        print(f"[ERROR] Building failed: {build_error}")

try:
    gemini_client = GeminiClient()
    print("[OK] Gemini client initialized")
except Exception as e:
    print(f"[ERROR] Gemini client initialization failed: {e}")

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    intent: str
    confidence: float
    sentiment: str
    response_type: str

CONFIDENCE_THRESHOLD = 0.85

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        user_message = request.message
        
        intent_result = intent_classifier.predict(user_message)
        sentiment_result = analyze_sentiment(user_message)
        
        intent = intent_result['intent']
        confidence = intent_result['confidence']
        sentiment = sentiment_result['sentiment']
        
        # Use Gemini for all queries except very high confidence greetings
        if confidence >= CONFIDENCE_THRESHOLD and intent in ['greeting', 'goodbye', 'thanks']:
            response = random.choice(intent_result['responses'])
            response_type = "ml_local"
        else:
            # Always try Gemini for knowledge questions
            if gemini_client:
                try:
                    context_docs = embedding_store.search(user_message, top_k=2)
                    context = "\n\n".join(context_docs) if context_docs else ""
                    response = gemini_client.generate_response(user_message, context)
                    response_type = "llm_gemini"
                except Exception as gemini_error:
                    print(f"Gemini error: {gemini_error}")
                    # Fallback to ML response if available
                    if intent_result['responses']:
                        response = random.choice(intent_result['responses'])
                        response_type = "ml_fallback"
                    else:
                        response = "I'm having trouble connecting to my knowledge base. Please try again."
                        response_type = "error"
            else:
                # No Gemini - use ML or fallback
                if intent_result['responses']:
                    response = random.choice(intent_result['responses'])
                    response_type = "ml_local"
                else:
                    response = "I need Gemini API to answer complex questions. Please configure GEMINI_API_KEY in server/.env"
                    response_type = "fallback"
        
        # Replace any PratChat references with Prat.AI
        response = response.replace("PratChat", "Prat.AI")
        response = response.replace("pratchat", "Prat.AI")
        response = response.replace("Pratchat", "Prat.AI")
        
        try:
            log_conversation(user_message, response, intent, confidence, sentiment, response_type)
        except Exception as log_error:
            print(f"Logging error: {log_error}")
        
        return ChatResponse(
            response=response,
            intent=intent,
            confidence=confidence,
            sentiment=sentiment,
            response_type=response_type
        )
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
