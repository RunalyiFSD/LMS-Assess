import os
import chromadb
from chromadb.utils import embedding_functions

class ChromaService:
    """Wrapper for ChromaDB persistent local storage."""
    
    def __init__(self, persist_directory: str = "chroma_db"):
        db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", persist_directory))
        os.makedirs(db_path, exist_ok=True)
        
        self.client = chromadb.PersistentClient(path=db_path)
        
        # Uses sentence-transformers/all-MiniLM-L6-v2 under the hood automatically
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()
        
        # Initialize Collections
        self.course_materials = self.client.get_or_create_collection(
            name="course_materials",
            embedding_function=self.embedding_fn
        )

    def ingest_chunks(self, chunks: list[str], metadatas: list[dict], ids: list[str]):
        """Adds embedded chunks to the course_materials collection."""
        self.course_materials.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )

    def query_course_materials(self, query: str, course_id: str, n_results: int = 5) -> list[str]:
        """Queries the vector DB specifically filtering by course_id."""
        results = self.course_materials.query(
            query_texts=[query],
            n_results=n_results,
            where={"course_id": course_id}
        )
        
        if not results['documents'] or len(results['documents']) == 0:
            return []
            
        return results['documents'][0]
