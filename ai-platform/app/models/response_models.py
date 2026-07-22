from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, Union

class GenerateResponse(BaseModel):
    status: str = Field("success", description="Status of the generation")
    response: str = Field(..., description="The generated text response")
    provider: str = Field(..., description="The provider used for generation")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional provider-specific metadata (usage, model, etc)")
