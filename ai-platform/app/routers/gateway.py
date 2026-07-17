from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import logging

from app.services.model_manager import ModelManager
from app.services.memory_manager import MemoryManager

router = APIRouter()
logger = logging.getLogger(__name__)

# Singletons for this foundation sprint
model_manager = ModelManager(provider="groq")
memory_manager = MemoryManager()

class ChatRequest(BaseModel):
    session_id: str
    message: str
    agent_type: Optional[str] = "general"

class ChatResponse(BaseModel):
    session_id: str
    response: str
    status: str = "success"

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Gateway endpoint for AI interactions.
    Routes to the appropriate agent based on agent_type.
    """
    try:
        # 1. Update memory with user message
        memory_manager.add_message(request.session_id, "user", request.message)
        
        # 2. Get context
        context = memory_manager.get_context(request.session_id)
        
        # 3. Route to agent logic (Mocked as a direct model call for foundation)
        # Ideally, we would have an AgentManager that picks the right agent class.
        
        # We ensure there's a system prompt if it's the first message
        messages_to_send = []
        if len(context) == 1:
            # First message
            system_msg = {"role": "system", "content": f"You are a helpful AI assistant in the LMS-Assess platform. You are operating as the '{request.agent_type}' agent."}
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
