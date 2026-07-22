from abc import ABC, abstractmethod
from typing import List

class EmbeddingProviderInterface(ABC):
    """Abstract base class for embedding providers."""
    
    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of documents."""
        pass
        
    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Generate an embedding for a single query string."""
        pass
