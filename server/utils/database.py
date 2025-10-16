from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

class Conversation(Base):
    __tablename__ = 'conversations'
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(255), nullable=False, default='default')
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    intent = Column(String(100))
    confidence = Column(Float)
    sentiment = Column(String(50))
    response_type = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise Exception("DATABASE_URL not found in environment variables")

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] NeonDB tables created/verified")
    except Exception as e:
        print(f"[ERROR] Database initialization failed: {e}")
        raise

def log_conversation(user_msg, bot_response, intent, confidence, sentiment, response_type, session_id='default'):
    db = SessionLocal()
    try:
        conv = Conversation(
            session_id=session_id,
            user_message=user_msg,
            bot_response=bot_response,
            intent=intent,
            confidence=confidence,
            sentiment=sentiment,
            response_type=response_type
        )
        db.add(conv)
        db.commit()
        print(f"[OK] Logged conversation to NeonDB for session: {session_id}")
    except Exception as e:
        print(f"[ERROR] Logging to NeonDB failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def get_chat_history(session_id='default', limit=50):
    db = SessionLocal()
    try:
        conversations = db.query(Conversation).filter(
            Conversation.session_id == session_id
        ).order_by(Conversation.timestamp.desc()).limit(limit).all()
        
        result = [{
            'id': conv.id,
            'user_message': conv.user_message,
            'bot_response': conv.bot_response,
            'intent': conv.intent,
            'confidence': conv.confidence,
            'sentiment': conv.sentiment,
            'response_type': conv.response_type,
            'timestamp': conv.timestamp.isoformat()
        } for conv in reversed(conversations)]
        
        print(f"[OK] Retrieved {len(result)} conversations from NeonDB for session: {session_id}")
        return result
    except Exception as e:
        print(f"[ERROR] History fetch from NeonDB failed: {e}")
        return []
    finally:
        db.close()

def clear_conversation_history(session_id='default'):
    db = SessionLocal()
    try:
        count = db.query(Conversation).filter(Conversation.session_id == session_id).count()
        db.query(Conversation).filter(Conversation.session_id == session_id).delete()
        db.commit()
        print(f"[OK] Cleared {count} conversations for session: {session_id}")
        return count
    except Exception as e:
        print(f"[ERROR] Clear history failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def get_stats():
    db = SessionLocal()
    try:
        total = db.query(Conversation).count()
        
        from sqlalchemy import text
        
        intents = db.execute(
            text("SELECT intent, COUNT(*) as count FROM conversations WHERE intent IS NOT NULL GROUP BY intent ORDER BY count DESC LIMIT 5")
        ).fetchall()
        
        sentiments = db.execute(
            text("SELECT sentiment, COUNT(*) as count FROM conversations WHERE sentiment IS NOT NULL GROUP BY sentiment")
        ).fetchall()
        
        avg_conf = db.execute(
            text("SELECT AVG(confidence) FROM conversations WHERE confidence IS NOT NULL")
        ).scalar() or 0
        
        return {
            "total_conversations": total,
            "top_intents": [{"intent": i[0], "count": i[1]} for i in intents],
            "sentiment_distribution": [{"sentiment": s[0], "count": s[1]} for s in sentiments],
            "average_confidence": round(float(avg_conf), 2)
        }
    except Exception as e:
        print(f"[ERROR] Stats fetch from NeonDB failed: {e}")
        return {"total_conversations": 0, "top_intents": [], "sentiment_distribution": [], "average_confidence": 0}
    finally:
        db.close()
