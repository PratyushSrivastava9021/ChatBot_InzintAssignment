import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

print("=" * 50)
print("Retraining ML Model with Prat.AI branding")
print("=" * 50)

try:
    from utils.ml_model import IntentClassifier
    from utils.embeddings import EmbeddingStore
    
    print("\n1. Retraining Intent Classifier...")
    classifier = IntentClassifier()
    classifier.train()
    classifier.save()
    print("   [OK] Intent classifier retrained and saved")
    
    print("\n2. Rebuilding Embeddings...")
    embedder = EmbeddingStore()
    embedder.build_index()
    embedder.save()
    print("   [OK] Embeddings rebuilt and saved")
    
    print("\n" + "=" * 50)
    print("Retraining complete! All models now use Prat.AI")
    print("=" * 50)
    print("\nPlease restart your server for changes to take effect:")
    print("  cd server")
    print("  python main.py")
    
except Exception as e:
    print(f"\n[ERROR] Retraining failed: {e}")
    import traceback
    traceback.print_exc()
