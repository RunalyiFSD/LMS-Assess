from fastapi import APIRouter
from datetime import datetime
from app.models.health_models import HealthResponse
from app.core.config import settings
from app.services.provider_factory import ProviderFactory

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    # Attempt to check provider health
    try:
        provider = ProviderFactory.get_provider(settings.AI_PROVIDER)
        await provider.health_check()
        status = "healthy"
    except Exception as e:
        status = f"degraded: {str(e)}"

    return HealthResponse(
        status=status,
        provider=settings.AI_PROVIDER,
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
