import requests

response = requests.post(
    "http://localhost:8000/api/stream", 
    json={"message": "hello", "session_id": "test"},
    stream=True
)

print(f"Status: {response.status_code}")
print("Raw chunks:")
for chunk in response.iter_content(chunk_size=1024):
    if chunk:
        print(f"CHUNK: {repr(chunk.decode('utf-8'))}")
        print("---")