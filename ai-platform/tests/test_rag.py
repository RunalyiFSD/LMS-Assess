import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.chromaService import ChromaService

def test_rag_service():
    print("Testing ChromaService RAG...")
    chroma = ChromaService()
    
    course_id = "test_course_999"
    chunks = [
        "The mitochondria is the powerhouse of the cell.",
        "Photosynthesis occurs in the chloroplasts."
    ]
    metadatas = [{"course_id": course_id, "index": 0}, {"course_id": course_id, "index": 1}]
    ids = ["c999_0", "c999_1"]
    
    # 1. Ingest
    chroma.ingest_chunks(chunks, metadatas, ids)
    print("✅ Ingested chunks.")
    
    # 2. Query
    results = chroma.query_course_materials("What powers the cell?", course_id)
    if results and "mitochondria" in results[0].lower():
        print("[PASS] Semantic retrieval successful. Found:", results[0])
    else:
        print("[FAIL] Semantic retrieval failed. Got:", results)
        
    # 3. Test Isolation (Querying different course)
    results_isolated = chroma.query_course_materials("What powers the cell?", "wrong_course")
    if not results_isolated:
        print("[PASS] Course isolation successful.")
    else:
        print("[FAIL] Course isolation failed. Got:", results_isolated)

if __name__ == "__main__":
    test_rag_service()
