from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class QueryRequest(BaseModel):
    collection_name: str = Field(..., description="Name of the collection to query")
    query: str = Field(..., description="The query string")
    n_results: int = Field(5, description="Number of results to return")
    metadata_filter: Optional[Dict[str, Any]] = Field(None, description="Optional metadata constraints to filter by")

class QueryResponse(BaseModel):
    collection_name: str
    chunks: List[str]
    status: str = "success"

class EmbedRequest(BaseModel):
    texts: List[str] = Field(..., description="List of strings to generate embeddings for")

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    status: str = "success"

class DeleteRequest(BaseModel):
    collection_name: str = Field(..., description="Name of the collection to delete from")
    metadata_filter: Dict[str, Any] = Field(..., description="Metadata constraint defining which documents to delete")
