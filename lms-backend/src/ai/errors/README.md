# Errors

## Purpose
Custom error classes specific to AI operations to allow for granular error handling.

## Responsibilities
- Define structured errors like `AIProviderError`, `AIRateLimitError`, `AIParsingError`, and `NotImplementedError`.
- Ensure AI failures do not crash the core application.

## Future Extension Points
- Adding automatic retry logic hooks inside specific error classes.
