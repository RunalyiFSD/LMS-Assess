import logging
from app.services.chromaService import ChromaService
from app.services.model_manager import ModelManager
from app.services.prompt_manager import PromptManager

logger = logging.getLogger(__name__)

class TutorAgent:
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.chroma_service = ChromaService()
        self.prompt_manager = PromptManager()
        
    def handle_message(self, course_id: str, message: str) -> str:
        """
        Handles a tutor request by fetching RAG context and generating a response.
        """
        try:
            # 1. Fetch semantic context from ChromaDB
            context_chunks = self.chroma_service.query_course_materials(
                query=message,
                course_id=course_id,
                n_results=3
            )
            
            combined_context = "\n\n".join(context_chunks) if context_chunks else "No relevant course material found."
            
            # 2. Render prompt
            prompt_text = self.prompt_manager.render(
                "tutor_agent.txt",
                context=combined_context,
                question=message
            )
            
            # 3. Generate response via ModelManager
            messages = [{"role": "user", "content": prompt_text}]
            result = self.model_manager.generate(messages)
            
            return result.get("content", "I am unable to process that right now.")
            
        except Exception as e:
            logger.error(f"Error in TutorAgent: {str(e)}")
            return "Sorry, I encountered an error while trying to help you."
