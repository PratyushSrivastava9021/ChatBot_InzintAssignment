import requests
import json

def test_regular_chat():
    print("Testing regular chat endpoint...")
    response = requests.post("http://localhost:8000/api/chat", json={"message": "hello"})
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    else:
        print(f"Error: {response.text}")

def test_stream_simple():
    print("\nTesting stream endpoint...")
    try:
        response = requests.post(
            "http://localhost:8000/api/stream", 
            json={"message": "hello", "session_id": "test"},
            stream=True,
            timeout=10
        )
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("Raw response:")
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    print(repr(chunk.decode('utf-8')))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_regular_chat()
    test_stream_simple()