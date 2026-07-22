from abc import ABC, abstractmethod

class DocumentLoaderInterface(ABC):
    """Abstract base class for document loaders."""
    
    @abstractmethod
    def extract_text(self, file_bytes: bytes) -> str:
        """Extract plain text from raw file bytes."""
        pass
