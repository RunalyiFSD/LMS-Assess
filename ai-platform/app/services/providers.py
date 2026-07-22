from typing import Dict, Any, AsyncGenerator
from app.services.provider_interface import ProviderInterface
from app.core.exceptions import ProviderError

class OpenAIProvider(ProviderInterface):
    async def generate(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> Dict[str, Any]:
        return {"response": f"Mock OpenAI response for: {prompt[:20]}...", "usage": {"total_tokens": 42}}

    async def stream(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> AsyncGenerator[str, None]:
        yield "Mock "
        yield "OpenAI "
        yield "stream."
        
    async def health_check(self) -> bool:
        return True

class GroqProvider(ProviderInterface):
    async def generate(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> Dict[str, Any]:
        return {"response": f"Mock Groq response for: {prompt[:20]}...", "usage": {"total_tokens": 42}}

    async def stream(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> AsyncGenerator[str, None]:
        yield "Mock "
        yield "Groq "
        yield "stream."
        
    async def health_check(self) -> bool:
        return True

class OllamaProvider(ProviderInterface):
    async def generate(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> Dict[str, Any]:
        return {"response": f"Mock Ollama response for: {prompt[:20]}...", "usage": {"total_tokens": 42}}

    async def stream(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> AsyncGenerator[str, None]:
        yield "Mock "
        yield "Ollama "
        yield "stream."
        
    async def health_check(self) -> bool:
        return True

class GeminiProvider(ProviderInterface):
    async def generate(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> Dict[str, Any]:
        return {"response": f"Mock Gemini response for: {prompt[:20]}...", "usage": {"total_tokens": 42}}

    async def stream(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> AsyncGenerator[str, None]:
        yield "Mock "
        yield "Gemini "
        yield "stream."
        
    async def health_check(self) -> bool:
        return True
