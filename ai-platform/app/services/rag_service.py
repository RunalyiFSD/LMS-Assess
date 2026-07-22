import uuid
from typing import List, Dict, Any, Optional
from app.services.vector_store.interface import VectorStoreInterface
from app.services.embeddings.interface import EmbeddingProviderInterface
from app.services.loaders.interface import DocumentLoaderInterface
from app.core.exceptions import AIPlatformException

class RAGService:
    """
    Orchestrates generic RAG operations by delegating to loaders, 
    embedders, and vector stores via interfaces.
    """
    def __init__(
        self,
        vector_store: VectorStoreInterface,
        embedding_provider: EmbeddingProviderInterface,
        document_loader: DocumentLoaderInterface = None
    ):
        self.vector_store = vector_store
        self.embedding_provider = embedding_provider
        self.document_loader = document_loader
        
    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Naive overlapping character chunking (carried over from legacy logic)."""
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap
        return chunks

    def ingest_document(self, file_bytes: bytes, collection_name: str, base_metadata: Dict[str, Any]) -> int:
        """
        Extract text from file bytes, chunk it, embed, and store in vector db.
        """
        if not self.document_loader:
            raise AIPlatformException("Document loader not provided.", status_code=500)
            
        full_text = self.document_loader.extract_text(file_bytes)
        chunks = self._chunk_text(full_text)
        
        metadatas = []
        ids = []
        for i in range(len(chunks)):
            meta = base_metadata.copy()
            meta["chunk_index"] = i
            metadatas.append(meta)
            ids.append(f"{uuid.uuid4().hex[:8]}_{i}")
            
        self.vector_store.add_documents(
            collection_name=collection_name,
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        return len(chunks)

    def query(self, collection_name: str, query: str, n_results: int = 5, metadata_filter: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Search for semantically similar chunks.
        """
        return self.vector_store.query(
            collection_name=collection_name,
            query=query,
            n_results=n_results,
            filter_metadata=metadata_filter
        )

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Return raw embeddings for a list of strings without saving them.
        """
        return self.embedding_provider.embed_documents(texts)
        
    def delete(self, collection_name: str, metadata_filter: Dict[str, Any]):
        """
        Delete documents matching metadata constraints.
        """
        if not metadata_filter:
            raise AIPlatformException("Delete operations require a metadata_filter to prevent mass deletion.", status_code=400)
        self.vector_store.delete(collection_name, metadata_filter)
