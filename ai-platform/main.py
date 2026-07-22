from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.core.logging import logger
from app.middleware.exception_handler import add_exception_handlers
from app.middleware.request_logging import RequestLoggingMiddleware
from app.middleware.auth import AuthMiddleware
from app.api.v1.health_routes import router as health_router
from app.api.v1.llm_routes import router as llm_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="LMS-Assess AI Platform",
        description="AI Platform Core for LMS-Assess project.",
        version="1.0.0",
    )

    # Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(AuthMiddleware)

    # Exception Handlers
    add_exception_handlers(app)

    # Routes
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(llm_router, prefix="/api/v1")

    return app

app = create_app()

if __name__ == "__main__":
    logger.info("Starting AI Platform...", extra_info={"host": settings.HOST, "port": settings.PORT})
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
