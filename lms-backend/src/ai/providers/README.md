# Providers

## Purpose
Abstracts the interactions with external LLM providers (e.g., OpenAI, Google Gemini, Anthropic) behind a common interface.

## Responsibilities
- Implement provider-specific API calls and response parsing.
- Adhere to the `BaseProvider` interface.
- Manage provider-specific error handling and rate-limit backoffs.

## Future Extension Points
- Adding new providers (e.g., `AnthropicProvider`, `LocalModelProvider`).
- Implementing streaming responses in the provider implementations.
