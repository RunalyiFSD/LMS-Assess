import os
from typing import List, Dict, Any, Optional
from groq import Groq

class ModelManager:
    """Orchestrates multi-provider model inference (Groq/OpenAI)."""

    def __init__(self, provider: str = "groq"):
        self.provider = provider
        
        if self.provider == "groq":
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("CRITICAL ERROR: GROQ_API_KEY is not set in environment.")
            self.client = Groq(api_key=api_key)
            self.default_model = "llama3-8b-8192"

    def generate(self, messages: List[Dict[str, str]], model: Optional[str] = None, tools: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Generates a completion for the given messages."""
        if self.provider == "groq":
            return self._generate_groq(messages, model, tools)
        else:
            raise NotImplementedError(f"Provider {self.provider} not supported.")

    def _generate_groq(self, messages: List[Dict[str, str]], model: Optional[str], tools: Optional[List[Dict]]) -> Dict[str, Any]:
        target_model = model or self.default_model
        
        params = {
            "messages": messages,
            "model": target_model,
        }
        
        if tools:
            params["tools"] = tools
            params["tool_choice"] = "auto"
            
        response = self.client.chat.completions.create(**params)
        
        choice = response.choices[0]
        result = {
            "content": choice.message.content,
            "tool_calls": getattr(choice.message, "tool_calls", None)
        }
        return result
