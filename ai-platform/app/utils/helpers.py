import time
import asyncio
from typing import Callable, Any
from app.core.exceptions import AIPlatformException

async def retry_with_backoff(func: Callable, max_retries: int = 3, initial_delay: float = 1.0, backoff_factor: float = 2.0) -> Any:
    """
    Retry an async function with exponential backoff.
    """
    delay = initial_delay
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise AIPlatformException(f"Operation failed after {max_retries} attempts: {str(e)}")
            await asyncio.sleep(delay)
            delay *= backoff_factor
