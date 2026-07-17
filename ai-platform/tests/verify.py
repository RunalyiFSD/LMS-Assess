import os
import sys

# Add parent directory to path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.prompt_manager import PromptManager
from app.services.memory_manager import MemoryManager

def test_prompt_manager():
    print("Testing PromptManager...")
    pm = PromptManager()
    result = pm.render("system_base.txt", bot_name="LMS-Bot", task="grading essays")
    expected = "You are a helpful AI named LMS-Bot.\nYour primary role is to assist the user with grading essays."
    
    if result == expected:
        print("[PASS] PromptManager rendered correctly.")
    else:
        print(f"[FAIL] PromptManager failed. Got: {result}")

def test_memory_manager():
    print("\nTesting MemoryManager...")
    mm = MemoryManager()
    session_id = "test_123"
    
    mm.add_message(session_id, "user", "Hello")
    mm.add_message(session_id, "assistant", "Hi there")
    
    ctx = mm.get_context(session_id)
    if len(ctx) == 2 and ctx[0]["content"] == "Hello" and ctx[1]["content"] == "Hi there":
        print("[PASS] MemoryManager stored and retrieved context correctly.")
    else:
        print("[FAIL] MemoryManager failed.")
        
    mm.clear_context(session_id)
    if len(mm.get_context(session_id)) == 0:
        print("[PASS] MemoryManager cleared context correctly.")
    else:
        print("[FAIL] MemoryManager failed to clear.")

if __name__ == "__main__":
    test_prompt_manager()
    test_memory_manager()
