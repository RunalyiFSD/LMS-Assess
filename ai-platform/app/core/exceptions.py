class AIPlatformException(Exception):
    """Base exception for AI Platform errors"""
    def __init__(self, message: str, status_code: int = 500, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class ProviderError(AIPlatformException):
    """Exception raised when an LLM provider fails"""
    pass

class PromptError(AIPlatformException):
    """Exception raised for invalid prompts or templates"""
    pass
