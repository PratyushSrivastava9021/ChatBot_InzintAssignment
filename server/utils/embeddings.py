import os
import pickle
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
KB_DIR = BASE_DIR / "data" / "knowledge_base"
MODELS_DIR = BASE_DIR / "models"

class EmbeddingStore:
    def __init__(self):
        self.documents = []
        
    def load_knowledge_base(self, kb_dir=None):
        if kb_dir is None:
            kb_dir = KB_DIR
        docs = []
        if os.path.exists(kb_dir):
            for filename in os.listdir(kb_dir):
                if filename.endswith('.txt'):
                    with open(os.path.join(kb_dir, filename), 'r', encoding='utf-8') as f:
                        content = f.read()
                        docs.append({"filename": filename, "content": content})
        return docs
    
    def build_index(self, kb_dir=None):
        if kb_dir is None:
            kb_dir = KB_DIR
        self.documents = self.load_knowledge_base(kb_dir)
        return {"status": "indexed", "documents": len(self.documents)}
    
    def search(self, query, top_k=2):
        # Simple keyword search fallback
        results = []
        query_lower = query.lower()
        
        for doc in self.documents:
            content = doc['content'].lower()
            if any(word in content for word in query_lower.split()):
                results.append(doc['content'])
                if len(results) >= top_k:
                    break
        
        return results[:top_k]
    
    def save(self, save_dir=None):
        if save_dir is None:
            save_dir = MODELS_DIR
        os.makedirs(save_dir, exist_ok=True)
        with open(save_dir / "documents.pkl", 'wb') as f:
            pickle.dump(self.documents, f)
    
    def load(self, save_dir=None):
        if save_dir is None:
            save_dir = MODELS_DIR
        try:
            with open(save_dir / "documents.pkl", 'rb') as f:
                self.documents = pickle.load(f)
        except FileNotFoundError:
            self.documents = []