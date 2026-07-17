from typing import List, Dict

class MemoryManager:
    """Manages short-term conversation context in memory."""
    
    def __init__(self):
        # In-memory dictionary: session_id -> list of messages
        self.sessions: Dict[str, List[Dict[str, str]]] = {}
        
    def get_context(self, session_id: str) -> List[Dict[str, str]]:
        """Retrieve conversation history for a session."""
        return self.sessions.get(session_id, [])
        
    def add_message(self, session_id: str, role: str, content: str):
        """Append a message to the session's history."""
        if session_id not in self.sessions:
            self.sessions[session_id] = []
            
        self.sessions[session_id].append({"role": role, "content": content})
        
    def clear_context(self, session_id: str):
        """Clear conversation history for a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
