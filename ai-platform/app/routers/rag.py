from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import logging
import uuid
import PyPDF2
import io

from app.services.chromaService import ChromaService

router = APIRouter()
logger = logging.getLogger(__name__)

chroma_service = ChromaService()

class QueryRequest(BaseModel):
    course_id: str
    query: str
    n_results: int = 5

class QueryResponse(BaseModel):
    course_id: str
    chunks: list[str]
    status: str = "success"

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Naive overlapping character chunking."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

@router.post("/ingest")
async def ingest_document(
    course_id: str = Form(...),
    document_title: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Extracts text from an uploaded PDF, chunks it, and ingests it into ChromaDB.
    """
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported currently.")
            
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        
        full_text = ""
        for page in pdf_reader.pages:
            full_text += page.extract_text() + "\n"
            
        if not full_text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in PDF.")
            
        chunks = chunk_text(full_text)
        
        # Prepare metadata and IDs
        metadatas = [{"course_id": course_id, "title": document_title, "chunk_index": i} for i in range(len(chunks))]
        ids = [f"{course_id}_{uuid.uuid4().hex[:8]}_{i}" for i in range(len(chunks))]
        
        chroma_service.ingest_chunks(chunks, metadatas, ids)
        
        return {"status": "success", "message": f"Ingested {len(chunks)} chunks into ChromaDB.", "course_id": course_id}
        
    except Exception as e:
        logger.error(f"Error in ingest_document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Queries ChromaDB for semantically similar chunks constrained by course_id.
    """
    try:
        chunks = chroma_service.query_course_materials(
            query=request.query, 
            course_id=request.course_id, 
            n_results=request.n_results
        )
        return QueryResponse(course_id=request.course_id, chunks=chunks)
    except Exception as e:
        logger.error(f"Error in query_documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
