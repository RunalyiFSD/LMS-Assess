import logging
import json
from app.services.model_manager import ModelManager
from app.services.prompt_manager import PromptManager

logger = logging.getLogger(__name__)

class QuestionGeneratorAgent:
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.prompt_manager = PromptManager()
        
    def handle_message(self, topic: str, difficulty: str = "medium", question_type: str = "multiple_choice") -> str:
        """
        Generates structured JSON questions based on a topic.
        We expect the model to return raw JSON string.
        """
        try:
            prompt_text = self.prompt_manager.render(
                "question_generator.txt",
                topic=topic,
                difficulty=difficulty,
                type=question_type
            )
            
            messages = [{"role": "user", "content": prompt_text}]
            
            # Use Groq's JSON mode if available, but for fallback just ask it to return raw JSON.
            # You can inject a schema here if using tool calling.
            result = self.model_manager.generate(messages)
            
            # Clean up the output in case it includes markdown ticks
            content = result.get("content", "{}")
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
                
            return content
            
        except Exception as e:
            logger.error(f"Error in QuestionGeneratorAgent: {str(e)}")
            return '{"error": "Failed to generate question"}'
