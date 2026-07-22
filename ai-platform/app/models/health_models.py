from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class HealthResponse(BaseModel):
    status: str = Field(..., description="Status of the AI platform (e.g., 'healthy')")
    provider: str = Field(..., description="Currently active LLM provider")
    version: str = Field(..., description="Platform version")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
