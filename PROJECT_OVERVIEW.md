# Prat.AI - Project Overview

## 📁 Project Structure

```
Prat.AI_LLM/
├── README.md                    # 📖 Complete project documentation
├── PROJECT_OVERVIEW.md          # 📋 This file - quick project layout
├── train_model.ipynb           # 🧠 ML training notebook
├── docker-compose.yml          # 🐳 Docker deployment
├── Dockerfile                  # 🐳 Docker configuration
│
├── client/                     # 🎨 React Frontend
│   ├── src/components/         # UI components
│   ├── src/context/           # State management
│   ├── src/config/            # API configuration
│   └── package.json           # Dependencies
│
├── server/                     # ⚙️ FastAPI Backend
│   ├── main.py                # Entry point
│   ├── routes/                # API endpoints
│   ├── utils/                 # Core logic (ML, RAG, etc.)
│   ├── requirements.txt       # Python dependencies
│   └── .env.sample           # Environment template
│
├── data/                      # 📊 Training & Knowledge Data
│   ├── intents.json          # Intent training data
│   └── knowledge_base/       # RAG documents
│
├── models/                    # 🤖 Trained ML Models
│   ├── vectorizer.pkl        # TF-IDF vectorizer
│   ├── classifier.pkl        # Intent classifier
│   └── *.pkl                 # Other model files
│
└── docs/                      # 📚 Technical Documentation
    ├── ARCHITECTURE.md        # System architecture details
    └── INTERVIEW_NOTES.md     # Interview preparation Q&A
```

## 🚀 Quick Start Commands

```bash
# 1. Setup Backend
cd server
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key" > .env
python main.py

# 2. Setup Frontend (new terminal)
cd client
npm install
npm run dev

# 3. Access Application
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

## 📖 Documentation Guide

| File | Purpose | When to Read |
|------|---------|--------------|
| **README.md** | Complete project guide | Start here - everything you need |
| **docs/ARCHITECTURE.md** | Technical deep dive | For understanding system design |
| **docs/INTERVIEW_NOTES.md** | Q&A preparation | Before technical interviews |
| **train_model.ipynb** | ML training process | To understand model training |

## 🎯 Key Features

- **Hybrid AI**: ML (70%) + LLM (30%) routing
- **Intent Classification**: scikit-learn with 85%+ accuracy
- **RAG System**: FAISS + sentence-transformers
- **Production Ready**: Logging, analytics, error handling
- **Cost Efficient**: ~$0.30 per 1000 conversations

## 🔧 Main Components

1. **Frontend**: React chat interface with Tailwind CSS
2. **Backend**: FastAPI with 4 main endpoints
3. **ML Pipeline**: TF-IDF + Logistic Regression
4. **RAG System**: Vector search with FAISS
5. **LLM Integration**: Gemini API with persona
6. **Database**: SQLite for conversation logging

## 📊 Performance

- ML Response: < 50ms
- LLM Response: < 2s
- Intent Accuracy: 85%+
- Confidence Threshold: 0.7

## 🎓 Interview Ready

This project demonstrates:
- ✅ Machine Learning (scikit-learn)
- ✅ LLM Integration (Gemini API)
- ✅ Full-Stack Development (React + FastAPI)
- ✅ Production Engineering (Docker, logging)
- ✅ System Design (hybrid architecture)

---

**Start with README.md for complete setup and documentation!**