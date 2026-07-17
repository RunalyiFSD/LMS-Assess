import logging
from app.services.model_manager import ModelManager
from app.services.prompt_manager import PromptManager

logger = logging.getLogger(__name__)

class CareerAgent:
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.prompt_manager = PromptManager()
        
    def handle_message(self, student_profile: str, message: str) -> str:
        """
        Provides career guidance based on the student's profile (grades, interests) and their query.
        """
        try:
            prompt_text = self.prompt_manager.render(
                "career_agent.txt",
                profile=student_profile,
                question=message
            )
            
            messages = [{"role": "user", "content": prompt_text}]
            result = self.model_manager.generate(messages)
            
            return result.get("content", "I am unable to provide career guidance at this moment.")
            
        except Exception as e:
            logger.error(f"Error in CareerAgent: {str(e)}")
            return "Sorry, I encountered an error while analyzing your career pathways."
