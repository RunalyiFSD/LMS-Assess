from typing import Any, Dict, List
from app.core.exceptions import AIPlatformException

def validate_required_fields(data: Dict[str, Any], required_fields: List[str]):
    """
    Validate that all required fields are present and not empty.
    """
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        raise AIPlatformException(
            f"Missing required fields in LLM response: {', '.join(missing)}",
            status_code=500
        )
