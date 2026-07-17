import logging
from app.services.model_manager import ModelManager
from app.services.prompt_manager import PromptManager

logger = logging.getLogger(__name__)

class CodingAssistantAgent:
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.prompt_manager = PromptManager()
        
    def handle_message(self, language: str, message: str) -> str:
        """
        Provides coding hints and conceptual guidance without writing full solutions.
        """
        try:
            prompt_text = self.prompt_manager.render(
                "coding_assistant_agent.txt",
                language=language,
                question=message
            )
            
            messages = [{"role": "user", "content": prompt_text}]
            result = self.model_manager.generate(messages)
            
            return result.get("content", "I am unable to process this coding query.")
            
        except Exception as e:
            logger.error(f"Error in CodingAssistantAgent: {str(e)}")
            return "Sorry, I encountered an error while trying to help you with code."
