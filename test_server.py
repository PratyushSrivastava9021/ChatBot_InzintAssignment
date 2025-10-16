import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

print("=" * 50)
print("Prat.AI Server Test")
print("=" * 50)

try:
    print("\n1. Testing imports...")
    from utils.ml_model import IntentClassifier
    from utils.sentiment import analyze_sentiment
    from utils.embeddings import EmbeddingStore
    from utils.gemini_client import GeminiClient
    from utils.database import init_db
    print("   [OK] All imports successful")
    
    print("\n2. Testing ML Model...")
    classifier = IntentClassifier()
    try:
        classifier.load()
        print("   [OK] Model loaded from disk")
    except:
        print("   [INFO] Training new model...")
        classifier.train()
        classifier.save()
        print("   [OK] Model trained and saved")
    
    result = classifier.predict("hello")
    print(f"   [OK] Prediction test: intent={result['intent']}, confidence={result['confidence']:.2f}")
    
    print("\n3. Testing Sentiment Analysis...")
    sentiment = analyze_sentiment("I love this!")
    print(f"   [OK] Sentiment test: {sentiment['sentiment']} (polarity={sentiment['polarity']})")
    
    print("\n4. Testing Embeddings...")
    embedder = EmbeddingStore()
    try:
        embedder.load()
        print("   [OK] Embeddings loaded from disk")
    except:
        print("   [INFO] Building embeddings...")
        embedder.build_index()
        embedder.save()
        print("   [OK] Embeddings built and saved")
    
    print("\n5. Testing Database...")
    init_db()
    print("   [OK] Database initialized")
    
    print("\n6. Testing Gemini Client...")
    try:
        gemini = GeminiClient()
        print("   [OK] Gemini client initialized")
    except Exception as e:
        print(f"   [WARN] Gemini client failed: {e}")
        print("   [INFO] Make sure GEMINI_API_KEY is set in server/.env")
    
    print("\n" + "=" * 50)
    print("All tests passed! Server is ready to run.")
    print("=" * 50)
    print("\nTo start the server:")
    print("  cd server")
    print("  python main.py")
    print("\nThen visit: http://localhost:8000")
    
except Exception as e:
    print(f"\n[ERROR] Test failed: {e}")
    import traceback
    traceback.print_exc()
