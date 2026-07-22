from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from app.core.exceptions import AIPlatformException
from app.core.logging import logger

def add_exception_handlers(app: FastAPI):
    @app.exception_handler(AIPlatformException)
    async def ai_platform_exception_handler(request: Request, exc: AIPlatformException):
        logger.error(f"AIPlatformException: {exc.message}", extra_info={"details": exc.details, "path": request.url.path})
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "message": exc.message, "details": exc.details},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Exception: {str(exc)}", extra_info={"path": request.url.path})
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "Internal Server Error", "details": str(exc)},
        )
