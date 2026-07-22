from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import logging

from app.services.model_manager import ModelManager
from app.services.memory_manager import MemoryManager
from app.agents.tutor_agent import TutorAgent
from app.agents.question_generator_agent import QuestionGeneratorAgent
from app.agents.evaluation_agent import EvaluationAgent
from app.agents.career_agent import CareerAgent
from app.agents.coding_assistant_agent import CodingAssistantAgent

router = APIRouter()
logger = logging.getLogger(__name__)

from functools import lru_cache

@lru_cache()
def get_model_manager():
    return ModelManager(provider="groq")

@lru_cache()
def get_memory_manager():
    return MemoryManager()

class ChatRequest(BaseModel):
    session_id: str
    message: str
    agent_type: Optional[str] = "general"
    context_id: Optional[str] = "global"  # Usually maps to course_id

class ChatResponse(BaseModel):
    session_id: str
    response: str
    status: str = "success"

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    model_manager: ModelManager = Depends(get_model_manager),
    memory_manager: MemoryManager = Depends(get_memory_manager)
):
    """
    Gateway endpoint for AI interactions.
    Routes to the appropriate agent based on agent_type.
    """
    try:
        # 1. Update memory with user message
        memory_manager.add_message(request.session_id, "user", request.message)
        
        # 2. Get context
        context = memory_manager.get_context(request.session_id)
        
        # 3. Route to agent logic
        if request.agent_type == "tutor" and request.context_id != "global":
            # Pass directly to Tutor Agent (which handles RAG)
            tutor_agent = TutorAgent(model_manager)
            ai_message = tutor_agent.handle_message(request.context_id, request.message)
            
        elif request.agent_type == "question_generator":
            # Pass to Question Generator Agent
            # The message is used as the 'topic'
            qgen_agent = QuestionGeneratorAgent(model_manager)
            ai_message = qgen_agent.handle_message(topic=request.message)
            
        elif request.agent_type == "evaluator":
            # We expect message to be a JSON string like: {"question": "...", "answer": "...", "max_points": 10}
            import json
            try:
                payload = json.loads(request.message)
                eval_agent = EvaluationAgent(model_manager)
                ai_message = eval_agent.handle_message(
                    question=payload.get("question", ""),
                    student_answer=payload.get("answer", ""),
                    max_points=payload.get("max_points", 10)
                )
            except Exception:
                ai_message = '{"error": "Invalid evaluator payload"}'
                
        elif request.agent_type == "career":
            import json
            try:
                payload = json.loads(request.message)
                career_agent = CareerAgent(model_manager)
                ai_message = career_agent.handle_message(
                    student_profile=payload.get("profile", "No profile provided"),
                    message=payload.get("question", "")
                )
            except Exception:
                ai_message = "Invalid career payload."

        elif request.agent_type == "coding":
            import json
            try:
                payload = json.loads(request.message)
                coding_agent = CodingAssistantAgent(model_manager)
                ai_message = coding_agent.handle_message(
                    language=payload.get("language", "General Programming"),
                    message=payload.get("question", "")
                )
            except Exception:
                ai_message = "Invalid coding payload."
                
        else:
            # Fallback to general conversational agent
            messages_to_send = []
            if len(context) == 1:
                # First message
                system_msg = {"role": "system", "content": f"You are a helpful AI assistant operating as the '{request.agent_type}' agent."}
                messages_to_send.append(system_msg)
                
            messages_to_send.extend(context)
            
            # 4. Generate response
            result = model_manager.generate(messages=messages_to_send)
            ai_message = result.get("content", "I am unable to process that right now.")
        
        # 5. Save AI response to memory
        memory_manager.add_message(request.session_id, "assistant", ai_message)
        
        return ChatResponse(session_id=request.session_id, response=ai_message)

    except Exception as e:
        logger.error(f"Error in chat_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
