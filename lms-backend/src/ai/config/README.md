# Config

## Purpose
Centralizes all configuration parameters specific to the AI module, parsing and validating environment variables before they are used.

## Responsibilities
- Provide a single source of truth for AI configuration (model names, provider selection, API keys).
- Handle graceful fallback when AI is disabled (`AI_ENABLED=false`).
- Expose limits (timeouts, retries) for LLM API calls.

## Future Extension Points
- Adding organization-level or tenant-level AI configuration overrides.
- Supporting multiple simultaneous providers for redundancy.
