from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class VectorStoreInterface(ABC):
    """Abstract base class for vector store implementations."""
    
    @abstractmethod
    def add_documents(self, collection_name: str, documents: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        """Add documents to a specific collection."""
        pass
        
    @abstractmethod
    def query(self, collection_name: str, query: str, n_results: int = 5, filter_metadata: Optional[Dict[str, Any]] = None) -> List[str]:
        """Query a collection for semantically similar documents."""
        pass
        
    @abstractmethod
    def delete(self, collection_name: str, filter_metadata: Dict[str, Any]):
        """Delete documents from a collection matching specific metadata."""
        pass
