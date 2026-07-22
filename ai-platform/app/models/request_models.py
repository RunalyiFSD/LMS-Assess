from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="The main user prompt or instruction")
    system_prompt: Optional[str] = Field(None, description="Optional system prompt to override default behavior")
    temperature: Optional[float] = Field(0.7, description="Sampling temperature")
    max_tokens: Optional[int] = Field(1024, description="Maximum tokens to generate")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context to format into the prompt")
    stream: Optional[bool] = Field(False, description="Whether to stream the response")
