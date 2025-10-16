import json
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

class IntentClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=100, ngram_range=(1, 2))
        self.classifier = LogisticRegression(max_iter=200)
        self.intent_labels = []
        self.intent_responses = {}
        
    def load_intents(self, filepath=None):
        if filepath is None:
            filepath = DATA_DIR / "intents.json"
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data['intents']
    
    def train(self, intents_filepath=None):
        intents = self.load_intents(intents_filepath)
        
        X = []
        y = []
        
        for intent in intents:
            tag = intent['tag']
            self.intent_responses[tag] = intent['responses']
            for pattern in intent['patterns']:
                X.append(pattern.lower())
                y.append(tag)
        
        self.intent_labels = list(set(y))
        
        X_vec = self.vectorizer.fit_transform(X)
        self.classifier.fit(X_vec, y)
        
        return {"status": "trained", "intents": len(self.intent_labels), "samples": len(X)}
    
    def predict(self, text):
        X_vec = self.vectorizer.transform([text.lower()])
        intent = self.classifier.predict(X_vec)[0]
        proba = self.classifier.predict_proba(X_vec)
        confidence = float(np.max(proba))
        
        return {
            "intent": intent,
            "confidence": confidence,
            "responses": self.intent_responses.get(intent, [])
        }
    
    def save(self, model_dir=None):
        if model_dir is None:
            model_dir = MODELS_DIR
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(self.vectorizer, model_dir / "vectorizer.pkl")
        joblib.dump(self.classifier, model_dir / "classifier.pkl")
        joblib.dump(self.intent_labels, model_dir / "intent_labels.pkl")
        joblib.dump(self.intent_responses, model_dir / "intent_responses.pkl")
    
    def load(self, model_dir=None):
        if model_dir is None:
            model_dir = MODELS_DIR
        self.vectorizer = joblib.load(model_dir / "vectorizer.pkl")
        self.classifier = joblib.load(model_dir / "classifier.pkl")
        self.intent_labels = joblib.load(model_dir / "intent_labels.pkl")
        self.intent_responses = joblib.load(model_dir / "intent_responses.pkl")
