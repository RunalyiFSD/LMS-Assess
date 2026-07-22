from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

load_dotenv()

from app.routers import gateway
from app.routers import rag

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup validation
    try:
        from app.services.model_manager import ModelManager
        # Validate Groq API key is present
        ModelManager(provider="groq")
        logger.info("AI Platform started successfully. Groq API Key validated.")
    except Exception as e:
        logger.error(f"Failed to initialize AI Services: {e}")
        # Allow app to start so health endpoint works, but log critical failure.
    yield
    # Shutdown
    logger.info("AI Platform shutting down.")

app = FastAPI(
    title="LMS-Assess AI Platform",
    description="AI services for question generation and grading.",
    version="0.1.0",
    lifespan=lifespan
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
