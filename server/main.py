from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Load environment variables FIRST before importing routes
load_dotenv(BASE_DIR / ".env")
print(f"[INFO] Loaded .env file, GEMINI_API_KEY present: {bool(os.getenv('GEMINI_API_KEY'))}")

from routes.chat import router as chat_router
from routes.train import router as train_router
from routes.stats import router as stats_router
from utils.database import init_db

app = FastAPI(title="Prat.AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        print("[OK] Database initialized")
    except Exception as e:
        print(f"[ERROR] Database init error: {e}")

app.include_router(chat_router, prefix="/api")
app.include_router(train_router, prefix="/api")
app.include_router(stats_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Prat.AI API - Hybrid ML + LLM System", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
