import sqlite3
from datetime import datetime
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BASE_DIR / "pratchat.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT NOT NULL,
            bot_response TEXT NOT NULL,
            intent TEXT,
            confidence REAL,
            sentiment TEXT,
            response_type TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()

def log_conversation(user_msg, bot_response, intent, confidence, sentiment, response_type):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO conversations (user_message, bot_response, intent, confidence, sentiment, response_type)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_msg, bot_response, intent, confidence, sentiment, response_type))
    
    conn.commit()
    conn.close()

def get_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM conversations")
    total_conversations = cursor.fetchone()[0]
    
    cursor.execute("SELECT intent, COUNT(*) as count FROM conversations GROUP BY intent ORDER BY count DESC LIMIT 5")
    top_intents = cursor.fetchall()
    
    cursor.execute("SELECT sentiment, COUNT(*) as count FROM conversations GROUP BY sentiment")
    sentiment_dist = cursor.fetchall()
    
    cursor.execute("SELECT AVG(confidence) FROM conversations WHERE confidence IS NOT NULL")
    avg_confidence = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "total_conversations": total_conversations,
        "top_intents": [{"intent": i[0], "count": i[1]} for i in top_intents],
        "sentiment_distribution": [{"sentiment": s[0], "count": s[1]} for s in sentiment_dist],
        "average_confidence": round(avg_confidence, 2)
    }
