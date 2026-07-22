import json
import re
from typing import Any, Dict

def parse_json_response(text: str) -> Dict[str, Any]:
    """
    Safely extract and parse JSON from an LLM response string.
    Handles cases where the LLM wraps JSON in markdown blocks.
    """
    try:
        # First try parsing the raw text
        return json.loads(text)
    except json.JSONDecodeError:
        pass
        
    # Look for markdown JSON block
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
            
    # If all else fails, return a wrapped string
    return {"extracted_text": text}
