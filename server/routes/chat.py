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
    print(f"[WARN] Loading failed, using fallback mode: {e}")
    # Create minimal fallback responses
    intent_classifier.intent_responses = {
        'greeting': ['Hello! I am Prat.AI, your hybrid AI assistant.'],
        'goodbye': ['Goodbye! Have a great day!'],
        'thanks': ['You\'re welcome!'],
        'identity': ['I am Prat.AI, an India\'s Indigenous hybrid AI assistant created by Pratyush Srivastava under PratWare — Multiverse of Softwares.']
    }
    print("[OK] Fallback responses initialized")

try:
    embedding_store.load()
    print("[OK] Embedding store loaded")
except Exception as e:
    print(f"[WARN] Loading failed, building index: {e}")
    try:
        kb_dir = BASE_DIR.parent / "data" / "knowledge_base"
        embedding_store.build_index(str(kb_dir))
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
    pdf_content: str = ""
    session_id: str = "default"

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
        
        # Handle prediction with fallback
        try:
            intent_result = intent_classifier.predict(user_message)
        except:
            # Fallback prediction based on keywords
            message_lower = user_message.lower()
            if any(word in message_lower for word in ['hello', 'hi', 'hey']):
                intent_result = {'intent': 'greeting', 'confidence': 0.9, 'responses': intent_classifier.intent_responses.get('greeting', [])}
            elif any(word in message_lower for word in ['bye', 'goodbye']):
                intent_result = {'intent': 'goodbye', 'confidence': 0.9, 'responses': intent_classifier.intent_responses.get('goodbye', [])}
            elif any(word in message_lower for word in ['thank', 'thanks']):
                intent_result = {'intent': 'thanks', 'confidence': 0.9, 'responses': intent_classifier.intent_responses.get('thanks', [])}
            elif any(word in message_lower for word in ['who are you', 'what are you', 'your name']):
                intent_result = {'intent': 'identity', 'confidence': 0.9, 'responses': intent_classifier.intent_responses.get('identity', [])}
            else:
                intent_result = {'intent': 'unknown', 'confidence': 0.1, 'responses': []}
        sentiment_result = analyze_sentiment(user_message)
        
        intent = intent_result['intent']
        confidence = intent_result['confidence']
        sentiment = sentiment_result['sentiment']
        
        # Use Gemini for all queries except very high confidence greetings
        if confidence >= CONFIDENCE_THRESHOLD and intent in ['greeting', 'goodbye', 'thanks'] and not request.pdf_content:
            responses = intent_result.get('responses', intent_classifier.intent_responses.get(intent, ['Hello!']))
            response = random.choice(responses)
            response_type = "ml_local"
        else:
            # Always try Gemini for knowledge questions or PDF queries
            if gemini_client:
                try:
                    context_docs = embedding_store.search(user_message, top_k=3)
                    context = "\n\n".join(context_docs) if context_docs else ""
                    
                    # Add PDF content if provided
                    if request.pdf_content:
                        context = f"PDF Content:\n{request.pdf_content}\n\n{context}"
                    
                    response = gemini_client.generate_response(user_message, context)
                    response_type = "llm_gemini"
                except Exception as gemini_error:
                    print(f"Gemini error: {gemini_error}")
                    # Fallback to ML response if available
                    responses = intent_result.get('responses', intent_classifier.intent_responses.get(intent, []))
                    if responses:
                        response = random.choice(responses)
                        response_type = "ml_fallback"
                    else:
                        response = "I'm having trouble connecting to my knowledge base. Please try again."
                        response_type = "error"
            else:
                # No Gemini - use ML or fallback
                responses = intent_result.get('responses', intent_classifier.intent_responses.get(intent, []))
                if responses:
                    response = random.choice(responses)
                    response_type = "ml_local"
                else:
                    response = "I need Gemini API to answer complex questions. Please configure GEMINI_API_KEY in server/.env"
                    response_type = "fallback"
        
        # Replace any PratChat references with Prat.AI
        response = response.replace("PratChat", "Prat.AI")
        response = response.replace("pratchat", "Prat.AI")
        response = response.replace("Pratchat", "Prat.AI")
        
        try:
            # Log with PDF indicator
            log_message = f"{user_message} [PDF: Yes]" if request.pdf_content else user_message
            log_conversation(log_message, response, intent, confidence, sentiment, response_type, request.session_id)
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
