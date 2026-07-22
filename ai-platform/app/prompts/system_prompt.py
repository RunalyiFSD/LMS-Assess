from app.prompts.base_prompt import BasePrompt
from typing import Dict, Any

class GenericSystemPrompt(BasePrompt):
    """
    A generic system prompt for standard LLM requests.
    """
    
    def get_system_prompt(self, context: Dict[str, Any] = None) -> str:
        return "You are a helpful AI assistant powering the LMS-Assess platform."
        
    def get_user_prompt(self, context: Dict[str, Any] = None) -> str:
        message = context.get("message", "")
        return f"{message}"
