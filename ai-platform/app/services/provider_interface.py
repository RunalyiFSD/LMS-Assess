from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator

class ProviderInterface(ABC):
    """Abstract base class for all LLM providers."""
    
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> Dict[str, Any]:
        """Generate text from the LLM."""
        pass
        
    @abstractmethod
    async def stream(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 1024, **kwargs) -> AsyncGenerator[str, None]:
        """Stream text from the LLM."""
        pass
        
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the provider is reachable and correctly configured."""
        pass
