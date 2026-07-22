import logging
import json
from app.services.model_manager import ModelManager
from app.services.prompt_manager import PromptManager

logger = logging.getLogger(__name__)

class EvaluationAgent:
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.prompt_manager = PromptManager()
        
    def handle_message(self, question: str, student_answer: str, max_points: int) -> str:
        """
        Evaluates a student's answer and returns a JSON string with score and feedback.
        """
        try:
            prompt_text = self.prompt_manager.render(
                "evaluation_agent.txt",
                question=question,
                answer=student_answer,
                max_points=str(max_points)
            )
            
            messages = [{"role": "user", "content": prompt_text}]
            result = self.model_manager.generate(messages)
            
            content = result.get("content", "{}")
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
                
            return content
            
        except Exception as e:
            logger.error(f"Error in EvaluationAgent: {str(e)}")
            return '{"score": 0, "feedback": "Failed to evaluate answer due to system error."}'
