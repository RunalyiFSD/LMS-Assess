# Middleware

## Purpose
Express middleware specific to the AI module.

## Responsibilities
- Apply AI-specific rate limits to protect LLM budgets.
- Inject AI configuration or logger context into `req.ai`.

## Future Extension Points
- AI feature-flag checks (blocking routes if a specific AI feature is disabled globally).
