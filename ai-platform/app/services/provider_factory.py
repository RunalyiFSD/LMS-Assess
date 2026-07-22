from app.services.provider_interface import ProviderInterface
from app.services.providers import OpenAIProvider, GroqProvider, OllamaProvider, GeminiProvider
from app.core.exceptions import AIPlatformException

class ProviderFactory:
    _providers = {
        "openai": OpenAIProvider,
        "groq": GroqProvider,
        "ollama": OllamaProvider,
        "gemini": GeminiProvider
    }

    @classmethod
    def get_provider(cls, provider_name: str) -> ProviderInterface:
        provider_class = cls._providers.get(provider_name.lower())
        if not provider_class:
            raise AIPlatformException(f"Unsupported AI provider: {provider_name}", status_code=400)
        return provider_class()
