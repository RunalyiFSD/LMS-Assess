import io
import PyPDF2
from app.services.loaders.interface import DocumentLoaderInterface
from app.core.exceptions import AIPlatformException

class PDFLoader(DocumentLoaderInterface):
    """Implementation of document loader for PDF files."""
    
    def extract_text(self, file_bytes: bytes) -> str:
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            full_text = ""
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
                    
            if not full_text.strip():
                raise AIPlatformException("No readable text found in PDF", status_code=400)
                
            return full_text
        except Exception as e:
            if isinstance(e, AIPlatformException):
                raise e
            raise AIPlatformException(f"Failed to process PDF: {str(e)}", status_code=500)
