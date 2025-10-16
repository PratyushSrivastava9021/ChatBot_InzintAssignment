import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment
BASE_DIR = Path(__file__).resolve().parent / "server"
load_dotenv(BASE_DIR / ".env")

print("=" * 50)
print("Testing Gemini API Connection")
print("=" * 50)

api_key = os.getenv("GEMINI_API_KEY")
print(f"\n1. API Key loaded: {bool(api_key)}")
if api_key:
    print(f"   Key starts with: {api_key[:20]}...")

try:
    sys.path.insert(0, str(BASE_DIR))
    from utils.gemini_client import GeminiClient
    
    print("\n2. Initializing Gemini client...")
    client = GeminiClient()
    print("   [OK] Client initialized successfully")
    
    print("\n3. Testing response generation...")
    response = client.generate_response("What is React.js?", "")
    print(f"   [OK] Response received ({len(response)} characters)")
    print(f"\n   Response preview:")
    print(f"   {response[:200]}...")
    
    print("\n" + "=" * 50)
    print("Gemini API is working perfectly!")
    print("=" * 50)
    
except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
