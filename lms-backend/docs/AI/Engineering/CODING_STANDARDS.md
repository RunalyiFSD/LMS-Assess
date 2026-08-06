---
Document: CODING_STANDARDS.md
Category: Engineering
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: AI V1
Related Documents: 
  - ARCHITECTURE.md
  - API_GUIDELINES.md
Dependencies: None
Last Updated: 2026-07-25
---

# 1. Formatting & Linting
To prevent code style debates and ensure readability, all code in the AI module must adhere to the global project linting rules.
- **Indentation**: 2 spaces (no tabs).
- **Semicolons**: Mandatory at the end of every statement.
- **Line Length**: Maximum 100 characters.
- **Quotes**: Single quotes (`'`) for JavaScript strings, backticks (`` ` ``) for template literals.

# 2. Naming Conventions
Consistency in naming allows developers to infer the purpose of a symbol instantly.
- **Variables & Functions**: `camelCase` (e.g., `generateQuestion`, `evaluationResult`).
- **Classes & Factories**: `PascalCase` (e.g., `GeminiProvider`, `ProviderFactory`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_TOKENS`, `DEFAULT_TEMPERATURE`).
- **Booleans**: Must be prefixed with `is`, `has`, or `should` (e.g., `isAIEnabled`, `hasError`).

# 3. Asynchronous Code
The AI module heavily relies on external network requests.
- **Async/Await**: Must be used exclusively. Do not use `.then().catch()` chains.
- **Error Bubbling**: Providers must not swallow errors. They must use `try/catch` to wrap network calls and re-throw wrapped custom errors to be handled by the controller's error middleware.
```javascript
// GOOD
async function fetchResponse(prompt) {
  try {
    return await provider.generate(prompt);
  } catch (error) {
    throw new AINetworkError('Failed to fetch from LLM', error);
  }
}
```

# 4. AI Module Specific Patterns
- **Provider Abstraction**: Never import `GeminiProvider` directly into a service. Always use `ProviderFactory.getProvider()`.
- **No Hardcoded Prompts**: Inline string templates for prompts are strictly forbidden. All prompts must be loaded from `src/ai/prompts/` via the Registry.
- **JSON Parsing**: Always assume LLM JSON output is malformed. Wrap `JSON.parse` in a try/catch and validate the resulting schema before passing it to the LMS logic.

# 5. Logging & Error Handling
- **AILogger**: Never use `console.log` directly for AI operations. Use `aiLogger.info()`, `aiLogger.warn()`, or `aiLogger.error()`.
- **Custom Errors**: Always throw specific errors (e.g., `NotImplementedError`, `LLMTimeoutError`) rather than generic `Error` objects so the global error handler can map them to correct HTTP status codes (e.g., 501, 504).

# 6. Typing & Documentation (JSDoc)
Because the LMS backend is written in JavaScript, we enforce pseudo-typing via JSDoc to maintain IDE autocomplete and developer sanity.
- **JSDoc Requirements**: Every Service method, Factory, and Provider class must have a JSDoc block detailing `@param` and `@returns`.
```javascript
/**
 * Generates an evaluation for a given student answer.
 * @param {string} question - The original question text.
 * @param {string} studentAnswer - The student's submitted text.
 * @returns {Promise<EvaluationResult>} An object containing score and feedback.
 */
```
