from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import pickle
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
KB_DIR = BASE_DIR / "data" / "knowledge_base"
MODELS_DIR = BASE_DIR / "models"

class EmbeddingStore:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        self.index = None
        self.documents = []
        self.dimension = 384
        
    def load_knowledge_base(self, kb_dir=None):
        if kb_dir is None:
            kb_dir = KB_DIR
        docs = []
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
        
        if not self.documents:
            return {"status": "no documents found"}
        
        texts = [doc['content'] for doc in self.documents]
        embeddings = self.model.encode(texts)
        
        self.index = faiss.IndexFlatL2(self.dimension)
        self.index.add(np.array(embeddings).astype('float32'))
        
        return {"status": "indexed", "documents": len(self.documents)}
    
    def search(self, query, top_k=2):
        if self.index is None or len(self.documents) == 0:
            return []
        
        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_embedding).astype('float32'), top_k)
        
        results = []
        for idx in indices[0]:
            if idx < len(self.documents):
                results.append(self.documents[idx]['content'])
        
        return results
    
    def save(self, save_dir=None):
        if save_dir is None:
            save_dir = MODELS_DIR
        os.makedirs(save_dir, exist_ok=True)
        faiss.write_index(self.index, str(save_dir / "faiss_index.bin"))
        with open(save_dir / "documents.pkl", 'wb') as f:
            pickle.dump(self.documents, f)
    
    def load(self, save_dir=None):
        if save_dir is None:
            save_dir = MODELS_DIR
        self.index = faiss.read_index(str(save_dir / "faiss_index.bin"))
        with open(save_dir / "documents.pkl", 'rb') as f:
            self.documents = pickle.load(f)
