from typing import List
from app.services.embeddings.interface import EmbeddingProviderInterface

try:
    # We use chromadb's default embedding function as a generic wrapper for now.
    from chromadb.utils import embedding_functions
    DEFAULT_EMBED_FN = embedding_functions.DefaultEmbeddingFunction()
except ImportError:
    DEFAULT_EMBED_FN = None

class DefaultEmbeddingProvider(EmbeddingProviderInterface):
    """
    Default embedding provider relying on sentence-transformers/all-MiniLM-L6-v2 
    (provided by Chroma's default embedding function).
    """
    
    def __init__(self):
        if DEFAULT_EMBED_FN is None:
            raise RuntimeError("chromadb is not installed. Default embeddings unavailable.")
        self.embed_fn = DEFAULT_EMBED_FN
        
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.embed_fn(texts)
        
    def embed_query(self, text: str) -> List[float]:
        results = self.embed_fn([text])
        if results and len(results) > 0:
            return results[0]
        return []
