# AI Module

## Purpose
This module encapsulates all AI-related functionality for the LMS. It is designed to be completely decoupled from the core business logic, ensuring that the LMS can function fully even if the AI module is disabled or fails.

## Responsibilities
- Provide AI-driven features (evaluation, question generation, tutoring, etc.)
- Manage interactions with external LLM providers
- Handle AI-specific configurations, prompts, and error tracking
- Ensure usage is logged and rate-limited

## Future Extension Points
- Integration of new LLM providers (e.g., Anthropic, Groq, local models)
- Advanced RAG (Retrieval-Augmented Generation) pipelines
- Background processing queues for heavy AI tasks
- Real-time streaming for AI tutoring

## Dependencies
- Does NOT depend on core controllers.
- Exposes services to be consumed by core services or dedicated AI controllers.

## Architecture Guidelines
- **AI disabled by default:** `AI_ENABLED=false` must result in no API calls, no loaded providers, and zero startup errors.
- **Provider Agnostic:** Controllers and Services must not know about OpenAI or Gemini. They must rely on `ProviderFactory` and the generic `BaseProvider` interface.
- **No Inline Prompts:** All prompts must be managed in the `prompts/` registry.
