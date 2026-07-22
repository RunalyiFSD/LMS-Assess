import os
from typing import List, Dict, Any, Optional
import chromadb
from app.services.vector_store.interface import VectorStoreInterface
from app.services.embeddings.interface import EmbeddingProviderInterface
from app.core.exceptions import AIPlatformException
from app.core.logging import logger

class ChromaStore(VectorStoreInterface):
    """ChromaDB implementation of the VectorStoreInterface."""
    
    def __init__(self, embedding_provider: EmbeddingProviderInterface, persist_directory: str = "chroma_db"):
        self.embedding_provider = embedding_provider
        
        # Absolute path resolution logic mapping from root ai-platform directory
        db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..", persist_directory))
        os.makedirs(db_path, exist_ok=True)
        
        try:
            self.client = chromadb.PersistentClient(path=db_path)
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB Client: {e}")
            raise AIPlatformException(f"Failed to initialize Vector Store: {e}")

    def _get_collection(self, collection_name: str):
        # Note: Chroma expects a specific embedding function signature. 
        # We wrap our provider to match Chroma's expected Callable interface.
        class WrapperEmbeddingFunction:
            def __init__(self, provider: EmbeddingProviderInterface):
                self.provider = provider
            def __call__(self, input: chromadb.Documents) -> chromadb.Embeddings:
                return self.provider.embed_documents(input)
                
        return self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=WrapperEmbeddingFunction(self.embedding_provider)
        )

    def add_documents(self, collection_name: str, documents: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        try:
            collection = self._get_collection(collection_name)
            collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
        except Exception as e:
            raise AIPlatformException(f"Error adding documents to ChromaDB: {str(e)}", status_code=500)

    def query(self, collection_name: str, query: str, n_results: int = 5, filter_metadata: Optional[Dict[str, Any]] = None) -> List[str]:
        try:
            collection = self._get_collection(collection_name)
            kwargs = {
                "query_texts": [query],
                "n_results": n_results
            }
            if filter_metadata:
                kwargs["where"] = filter_metadata
                
            results = collection.query(**kwargs)
            
            if not results.get('documents') or len(results['documents']) == 0:
                return []
                
            return results['documents'][0]
        except Exception as e:
            raise AIPlatformException(f"Error querying ChromaDB: {str(e)}", status_code=500)

    def delete(self, collection_name: str, filter_metadata: Dict[str, Any]):
        try:
            collection = self._get_collection(collection_name)
            collection.delete(where=filter_metadata)
        except Exception as e:
            raise AIPlatformException(f"Error deleting from ChromaDB: {str(e)}", status_code=500)
