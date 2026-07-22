from abc import ABC, abstractmethod
from typing import Dict, Any

class BasePrompt(ABC):
    """
    Abstract base class for all prompts in the system.
    Enforces a consistent interface for rendering prompts with context.
    """
    
    @abstractmethod
    def get_system_prompt(self, context: Dict[str, Any] = None) -> str:
        """Return the system instructions for the LLM."""
        pass
        
    @abstractmethod
    def get_user_prompt(self, context: Dict[str, Any] = None) -> str:
        """Return the main user prompt rendered with the provided context."""
        pass
