import json
from fastapi import APIRouter, Depends, Form, File, UploadFile
from app.models.rag_models import QueryRequest, QueryResponse, EmbedRequest, EmbedResponse, DeleteRequest
from app.services.rag_service import RAGService
from app.services.embeddings.default_embed import DefaultEmbeddingProvider
from app.services.vector_store.chroma_store import ChromaStore
from app.services.loaders.pdf_loader import PDFLoader
from app.core.exceptions import AIPlatformException

router = APIRouter(prefix="/rag", tags=["RAG"])

# Dependency Injection
def get_rag_service() -> RAGService:
    try:
        embed_provider = DefaultEmbeddingProvider()
        vector_store = ChromaStore(embedding_provider=embed_provider)
        loader = PDFLoader()
        return RAGService(
            vector_store=vector_store,
            embedding_provider=embed_provider,
            document_loader=loader
        )
    except Exception as e:
        raise AIPlatformException(f"Could not initialize RAG service: {str(e)}", status_code=500)


@router.post("/ingest")
async def ingest_document(
    collection_name: str = Form(...),
    metadata: str = Form(..., description="JSON string of metadata"),
    file: UploadFile = File(...),
    rag_service: RAGService = Depends(get_rag_service)
):
    try:
        base_metadata = json.loads(metadata)
    except json.JSONDecodeError:
        raise AIPlatformException("Metadata must be a valid JSON string.", status_code=400)
        
    content = await file.read()
    
    num_chunks = rag_service.ingest_document(
        file_bytes=content,
        collection_name=collection_name,
        base_metadata=base_metadata
    )
    
    return {"status": "success", "message": f"Ingested {num_chunks} chunks."}


@router.post("/query", response_model=QueryResponse)
async def query_documents(
    request: QueryRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    chunks = rag_service.query(
        collection_name=request.collection_name,
        query=request.query,
        n_results=request.n_results,
        metadata_filter=request.metadata_filter
    )
    return QueryResponse(collection_name=request.collection_name, chunks=chunks)


@router.post("/embed", response_model=EmbedResponse)
async def embed_texts(
    request: EmbedRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    embeddings = rag_service.embed_texts(request.texts)
    return EmbedResponse(embeddings=embeddings)


@router.post("/delete")
async def delete_documents(
    request: DeleteRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    rag_service.delete(request.collection_name, request.metadata_filter)
    return {"status": "success", "message": "Documents deleted."}
