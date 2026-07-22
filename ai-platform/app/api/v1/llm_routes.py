from fastapi import APIRouter, Depends
from app.models.request_models import GenerateRequest
from app.models.response_models import GenerateResponse
from app.services.llm_service import LLMService

router = APIRouter(prefix="/llm", tags=["LLM"])

@router.post("/generate", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    """
    Generate text using the configured AI provider.
    """
    return await LLMService.generate(request)
