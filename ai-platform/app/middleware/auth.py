from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class AuthMiddleware(BaseHTTPMiddleware):
    """
    Simple auth middleware to ensure requests come from the trusted Express backend.
    In a real system, you might validate a shared secret or JWT here.
    """
    async def dispatch(self, request: Request, call_next):
        # Allow health checks without auth
        if request.url.path.endswith("/health"):
            return await call_next(request)
            
        # Example: check for a specific internal token header
        # token = request.headers.get("X-AI-Service-Token")
        # if token != settings.INTERNAL_SECRET:
        #     return JSONResponse(status_code=401, content={"message": "Unauthorized access"})
        
        return await call_next(request)
