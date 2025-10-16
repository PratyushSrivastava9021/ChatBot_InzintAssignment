#!/usr/bin/env python3
"""
Quick test script to verify streaming functionality
"""
import requests
import json

def test_streaming():
    url = "http://localhost:8000/api/stream"
    data = {
        "message": "Hello, what's your name?",
        "session_id": "test_session"
    }
    
    try:
        response = requests.post(url, json=data, stream=True)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("Streaming response:")
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    chunk_str = chunk.decode('utf-8')
                    lines = chunk_str.split('\n')
                    for line in lines:
                        if line.startswith('data: '):
                            try:
                                json_data = json.loads(line[6:])
                                if json_data.get('content'):
                                    print(json_data['content'], end='', flush=True)
                                if json_data.get('done'):
                                    print("\n✅ Streaming completed!")
                                    return
                            except json.JSONDecodeError:
                                continue
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure backend is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*50)

if __name__ == "__main__":
    test_streaming()