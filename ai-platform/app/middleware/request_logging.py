from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import time
import uuid
from app.core.logging import logger

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        logger.info(f"Incoming Request", extra_info={
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url)
        })
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        logger.info(f"Request Completed", extra_info={
            "request_id": request_id,
            "status_code": response.status_code,
            "process_time_ms": round(process_time * 1000, 2)
        })
        
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id
        return response
