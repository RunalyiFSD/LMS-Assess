# Controllers

## Purpose
Handles HTTP requests and responses specific to AI endpoints.

## Responsibilities
- Validate incoming AI API requests (e.g., extracting attempt ID, checking permissions).
- Call the appropriate AI Service.
- Format the AI Service response into a standard HTTP JSON response.
- Catch and handle AI-specific errors gracefully (e.g., falling back to human review if AI fails).

## Future Extension Points
- Implementing endpoints for AI tutor chat history.
- Handling streaming endpoints (e.g., Server-Sent Events or WebSockets) for real-time AI responses.
