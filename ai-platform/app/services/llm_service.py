from app.core.config import settings
from app.services.provider_factory import ProviderFactory
from app.models.request_models import GenerateRequest
from app.models.response_models import GenerateResponse

class LLMService:
    @staticmethod
    async def generate(request: GenerateRequest) -> GenerateResponse:
        provider = ProviderFactory.get_provider(settings.AI_PROVIDER)
        
        # Add context formatting if context is provided
        prompt = request.prompt
        if request.context:
            prompt += f"\n\nContext:\n{request.context}"

        result = await provider.generate(
            prompt=prompt,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        return GenerateResponse(
            response=result.get("response", ""),
            provider=settings.AI_PROVIDER,
            metadata=result.get("usage", {})
        )
