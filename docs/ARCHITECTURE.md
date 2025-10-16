# PratChat Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Main   │  │ Sidebar  │  │ Context  │  │   API    │   │
│  │Component │  │Component │  │ Provider │  │  Client  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    main.py                            │  │
│  │              (Entry Point + CORS)                     │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│       ┌───────────────┼───────────────┐                     │
│       ▼               ▼               ▼                     │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐                  │
│  │  /chat  │   │ /train  │   │ /stats  │                  │
│  │  route  │   │  route  │   │  route  │                  │
│  └────┬────┘   └────┬────┘   └────┬────┘                  │
│       │             │              │                        │
│       ▼             ▼              ▼                        │
│  ┌──────────────────────────────────────┐                  │
│  │           UTILITIES LAYER            │                  │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐ │                  │
│  │  │   ML   │ │Sentiment│ │Embeddings│ │                  │
│  │  │ Model  │ │Analysis │ │   RAG    │ │                  │
│  │  └────────┘ └────────┘ └──────────┘ │                  │
│  │  ┌────────┐ ┌────────┐              │                  │
│  │  │ Gemini │ │Database│              │                  │
│  │  │ Client │ │ SQLite │              │                  │
│  │  └────────┘ └────────┘              │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐      ┌────────┐     ┌────────┐
    │ Models │      │  Data  │     │Database│
    │  .pkl  │      │  .json │     │  .db   │
    └────────┘      └────────┘     └────────┘
```

## Request Flow

### Scenario 1: High Confidence (ML Response)

```
User: "hello"
  │
  ▼
Frontend → POST /api/chat {"message": "hello"}
  │
  ▼
Backend receives request
  │
  ├─→ Intent Classifier
  │     Input: "hello"
  │     Output: {intent: "greeting", confidence: 0.95}
  │
  ├─→ Sentiment Analyzer
  │     Input: "hello"
  │     Output: {sentiment: "neutral", polarity: 0.0}
  │
  ├─→ Routing Decision
  │     confidence (0.95) >= threshold (0.7) ✓
  │     → Use ML response
  │
  ├─→ Select Response
  │     responses = ["Hello! I'm PratChat...", "Hi there!"]
  │     selected = random.choice(responses)
  │
  ├─→ Log to Database
  │     INSERT INTO conversations (...)
  │
  └─→ Return Response
        {
          "response": "Hello! I'm PratChat...",
          "intent": "greeting",
          "confidence": 0.95,
          "sentiment": "neutral",
          "response_type": "ml_local"
        }
```

### Scenario 2: Low Confidence (LLM Response)

```
User: "Explain quantum entanglement"
  │
  ▼
Frontend → POST /api/chat
  │
  ▼
Backend receives request
  │
  ├─→ Intent Classifier
  │     Input: "Explain quantum entanglement"
  │     Output: {intent: "unknown", confidence: 0.35}
  │
  ├─→ Sentiment Analyzer
  │     Output: {sentiment: "neutral"}
  │
  ├─→ Routing Decision
  │     confidence (0.35) < threshold (0.7) ✗
  │     → Use LLM response
  │
  ├─→ RAG Retrieval
  │     1. Embed query with sentence-transformers
  │     2. Search FAISS index for similar docs
  │     3. Retrieve top-2 documents
  │     context = "PratChat is... [doc content]"
  │
  ├─→ Gemini API Call
  │     prompt = PERSONA + context + user_message
  │     response = gemini.generate(prompt)
  │
  ├─→ Log to Database
  │
  └─→ Return Response
        {
          "response": "Quantum entanglement is...",
          "intent": "unknown",
          "confidence": 0.35,
          "sentiment": "neutral",
          "response_type": "llm_gemini"
        }
```

## Component Details

### Frontend Components

#### Main.jsx
- **Purpose**: Chat interface
- **State**: input, messages, loading
- **Features**: 
  - Message display
  - Loading animation
  - About modal
  - Error handling

#### Sidebar.jsx
- **Purpose**: Navigation and history
- **Features**:
  - Chat history
  - New chat button
  - Collapsible design

#### Context.jsx
- **Purpose**: Global state management
- **Provides**:
  - Chat state
  - API call functions
  - Error handling

### Backend Routes

#### /api/chat
- **Method**: POST
- **Input**: `{"message": "..."}`
- **Process**:
  1. Validate input
  2. Predict intent
  3. Analyze sentiment
  4. Route to ML or LLM
  5. Log conversation
  6. Return response
- **Output**: Response with metadata

#### /api/train
- **Method**: POST
- **Process**:
  1. Load intents.json
  2. Train TF-IDF + LogisticRegression
  3. Save models to disk
- **Output**: Training status

#### /api/embed
- **Method**: POST
- **Process**:
  1. Load knowledge base files
  2. Generate embeddings
  3. Build FAISS index
  4. Save index to disk
- **Output**: Indexing status

#### /api/stats
- **Method**: GET
- **Process**:
  1. Query SQLite database
  2. Aggregate statistics
- **Output**: Analytics data

### ML Pipeline

```
Text Input
  │
  ▼
Preprocessing (lowercase, clean)
  │
  ▼
TF-IDF Vectorization
  │
  ▼
Logistic Regression
  │
  ├─→ Intent Label
  └─→ Confidence Score
```

### RAG Pipeline

```
Knowledge Base (.txt files)
  │
  ▼
Sentence Transformer (embeddings)
  │
  ▼
FAISS Index (vector store)
  │
  ▼
Query → Embed → Search → Retrieve
  │
  ▼
Context for LLM
```

## Data Flow

### Training Phase
```
data/intents.json
  │
  ▼
train_model.ipynb / /api/train
  │
  ▼
TF-IDF + LogisticRegression
  │
  ▼
models/*.pkl
```

### Inference Phase
```
User Message
  │
  ├─→ models/vectorizer.pkl → TF-IDF features
  │
  ├─→ models/classifier.pkl → Intent prediction
  │
  └─→ models/intent_responses.pkl → Response templates
```

### RAG Phase
```
data/knowledge_base/*.txt
  │
  ▼
sentence-transformers
  │
  ▼
models/faiss_index.bin
  │
  ▼
Query → Similar docs → Context
```

## Technology Stack

### Frontend
- **React 19**: UI framework
- **Tailwind CSS**: Styling
- **Context API**: State management
- **Vite**: Build tool

### Backend
- **FastAPI**: Web framework
- **Python 3.9+**: Language
- **uvicorn**: ASGI server

### ML/AI
- **scikit-learn**: Intent classification
- **TextBlob**: Sentiment analysis
- **sentence-transformers**: Embeddings
- **FAISS**: Vector search
- **Gemini API**: LLM

### Data
- **SQLite**: Conversation logs
- **JSON**: Intent data
- **Text files**: Knowledge base

## Deployment Architecture

### Development
```
localhost:5173 (Frontend)
localhost:8000 (Backend)
```

### Docker
```
Container 1: Backend (Python)
Container 2: Frontend (Node)
Shared: Volume for data/models
```

### Production (Recommended)
```
┌─────────┐
│  Nginx  │ (Reverse proxy)
└────┬────┘
     │
     ├─→ Frontend (Static files)
     │
     └─→ Backend (Gunicorn + FastAPI)
          │
          ├─→ Redis (Cache)
          ├─→ PostgreSQL (Database)
          └─→ Model Server (TF Serving)
```

## Security Layers

1. **Input Validation**: Pydantic models
2. **CORS**: Restricted origins
3. **Environment Variables**: API keys in .env
4. **Error Handling**: Try-except blocks
5. **Logging**: Track all requests
6. **Rate Limiting**: (TODO)

## Performance Optimizations

1. **ML Caching**: Cache predictions for common queries
2. **Response Caching**: Store LLM responses
3. **Async Operations**: Non-blocking I/O
4. **Batch Processing**: Group API calls
5. **Model Loading**: Load once at startup

## Scalability Considerations

### Current Limits
- SQLite: ~100K conversations
- FAISS: ~1M vectors in memory
- Single server: ~100 req/sec

### Scale Solutions
- **Database**: PostgreSQL with connection pooling
- **Vector Store**: Pinecone or Weaviate
- **Caching**: Redis for hot data
- **Load Balancing**: Multiple backend instances
- **Model Serving**: Separate ML service

## Monitoring Points

1. **Request Latency**: Time per endpoint
2. **ML Confidence**: Distribution of scores
3. **Routing Ratio**: ML vs LLM usage
4. **API Costs**: Gemini token usage
5. **Error Rate**: Failed requests
6. **User Satisfaction**: Feedback scores

---

This architecture balances simplicity, performance, and maintainability while remaining production-ready.
