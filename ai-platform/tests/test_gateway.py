from fastapi.testclient import TestClient
from app.routers import gateway
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_chat_invalid_payload():
    response = client.post("/api/v1/ai/chat", json={})
    assert response.status_code == 422 # FastAPI validation error
