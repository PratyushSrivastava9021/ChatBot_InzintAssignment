# Prat.AI - Hybrid LLM Chatbot

A smart chatbot that combines machine learning with LLM capabilities. Uses local ML models for common queries (fast & free) and falls back to Gemini API for complex questions.

**Tech Stack:** React, FastAPI, scikit-learn, Gemini API, PostgreSQL

## Features

- Hybrid routing (70% ML, 30% LLM) for cost efficiency
- ChatGPT-style streaming responses with markdown
- PDF file upload support
- Conversation persistence across sessions
- Intent classification & sentiment analysis
- RAG (Retrieval-Augmented Generation) with FAISS

## How It Works

1. User sends a message
2. ML model classifies intent with confidence score
3. If confidence ≥ 70% → return ML response (fast)
4. If confidence < 70% → use Gemini API with RAG context (accurate)
5. Response streams character-by-character to frontend
6. Conversation logged to database

## Project Structure

```
chatbot_inzint/
├── client/              # React frontend (Vite + Tailwind)
├── server/              # FastAPI backend
│   ├── routes/          # API endpoints
│   └── utils/           # ML models, RAG, database
├── data/
│   ├── intents.json     # Training data
│   └── knowledge_base/  # RAG documents
└── models/              # Trained ML models (auto-generated)
```

## Setup

**Prerequisites:** Node.js 16+, Python 3.9+, [Gemini API key](https://makersuite.google.com/app/apikey)

### Backend

```bash
cd server
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env
echo "DATABASE_URL=your_db_url" >> .env

python main.py  # Runs on http://localhost:8000
```

### Frontend

```bash
cd client
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

npm run dev  # Runs on http://localhost:5173
```

### Train Models (Optional)

```bash
curl -X POST http://localhost:8000/api/train
curl -X POST http://localhost:8000/api/embed
```

## Deployment

Currently deployed on:
- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

For CORS, add your production URL to `server/main.py`:
```python
origins = [
    "http://localhost:5173",
    "https://your-app.vercel.app"  # Add your URL
]
```

## API Endpoints

- `POST /api/chat` - Send message, get response
- `POST /api/stream` - Streaming response (SSE)
- `POST /api/pdf` - Upload PDF file
- `GET /api/stats` - Analytics data
- `POST /api/train` - Retrain ML model
- `POST /api/embed` - Rebuild RAG index

## Customization

**Add custom intents:** Edit `data/intents.json` and retrain
```bash
curl -X POST http://localhost:8000/api/train
```

**Add knowledge base docs:** Add `.txt` files to `data/knowledge_base/` and rebuild
```bash
curl -X POST http://localhost:8000/api/embed
```

## Troubleshooting

**CORS errors:** Add your domain to `server/main.py` origins list

**Models not loading:** Run training endpoint or check `models/` directory exists

**State not persisting:** Check browser localStorage is enabled

## License

MIT License - Created by Pratyush

---

**Prat.AI** - Hybrid AI chatbot with local ML + LLM capabilities 🚀
