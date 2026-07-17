from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.routers import gateway
from app.routers import rag

app = FastAPI(
    title="LMS-Assess AI Platform",
    description="AI services for question generation and grading.",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_URL", "http://localhost:5173"), "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "ai-platform"}

app.include_router(gateway.router, prefix="/api/v1/ai", tags=["AI Gateway"])
app.include_router(rag.router, prefix="/api/v1/ai/rag", tags=["RAG"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
