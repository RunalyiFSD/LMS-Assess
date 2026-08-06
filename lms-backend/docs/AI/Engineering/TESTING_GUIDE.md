---
Document: TESTING_GUIDE.md
Category: Engineering
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: Backend (AI Module)
Related Documents:
  - ARCHITECTURE.md
  - CODING_STANDARDS.md
  - API_GUIDELINES.md
Dependencies:
  - ARCHITECTURE.md
  - CODING_STANDARDS.md
  - API_GUIDELINES.md
Last Updated: 2026-07-25
---

# Chapter 1 — Testing Philosophy
The LMS-Assess AI module strictly prioritizes reliability before optimization. Testing must focus on behavior and contract validation rather than implementation details. Because AI outputs are inherently probabilistic, tests must validate structural contracts (schemas) rather than exact wording. Every sprint must include automated testing to prevent regressions.

# Chapter 2 — Testing Pyramid
- **Unit Testing**: For deterministic backend logic (e.g., prompt parsing, factory instantiation).
- **Integration Testing**: For verifying interactions between services and mocked providers.
- **API Testing**: For validating endpoint contracts, auth, and rate limits.
- **End-to-End Testing**: For verifying the full pipeline.
- **AI Validation Testing**: Offline regression testing to evaluate prompt quality against gold-standard datasets.

# Chapter 3 — Backend Testing Standards
Traditional backend components (Routes, Controllers, Services, Middleware, Models, Utilities) must be tested using Jest and Supertest. Unit tests must achieve high coverage for deterministic paths, particularly error handling, RBAC (`restrictTo`), and input sanitization.

# Chapter 4 — AI Provider Mocking
Automated CI/CD tests must **never** hit live external LLM providers to prevent cost overruns and pipeline flakiness.
- **ProviderFactory Mocking**: The factory must be stubbed to return a `MockProvider`.
- **Simulations**: The mock must support simulating fake latency, specific JSON responses, network failures, authentication failures, and provider timeouts.

# Chapter 5 — Prompt Validation
Before runtime execution, prompts must be validated:
- **Template Validation**: Ensure `.txt` templates exist and contain no syntax errors.
- **Variable Substitution**: Assert that all placeholders (e.g., `{{topic}}`) are correctly injected without leaving unresolved brackets.

# Chapter 6 — Response Schema Validation
AI responses must be validated structurally, not textually.
- **JSON Schema**: Assert that the output is valid JSON.
- **Required Fields**: Ensure required properties (e.g., `score`, `feedback`) exist and match expected data types.
- Tests must explicitly verify that the system gracefully handles malformed provider outputs.

# Chapter 7 — Non-Deterministic Output Testing
Because exact strings cannot be predicted:
- **Structural Validation**: Assert on the presence of keys and types.
- **Semantic Validation**: Use offline evaluation scripts for evaluating the *quality* of the feedback.
- **Acceptable Variation**: Exact string assertions (`expect(res).toEqual("...")`) are strictly prohibited for AI outputs.

# Chapter 8 — Failure & Recovery Testing
The system must gracefully handle failures. Tests must simulate:
- Provider unavailability (`503`).
- Gateway timeouts (`504`).
- Rate limiting and invalid API keys.
- Corrupted or empty LLM responses (`400`).
Verify that the `AILogger` captures these failures and the API returns the standardized error payload.

# Chapter 9 — Token Usage & Performance Testing
Tests must validate the operational characteristics of AI requests.
- Assert that the `AIUsageMetrics` logging mechanism fires correctly with accurately mocked token counts.
- Verify that performance thresholds and latency tracking are recorded accurately during service execution.

# Chapter 10 — API Contract Testing
AI endpoints must comply with `API_GUIDELINES.md`. Tests must verify:
- Correct Request/Response payloads.
- Authentication (`protect`) and Authorization (`restrictTo`).
- Proper mapping of custom errors to HTTP status codes.

# Chapter 11 — Regression Testing
Future prompt or provider changes must not degrade expected behavior.
- **Snapshot Strategy**: Use snapshot testing for the generated prompt text to detect unintended template changes.
- **Prompt Regression**: Maintain a test suite of sample student answers and expected scores to run manually when prompts are heavily altered.

# Chapter 12 — Test Data Management
Test fixtures must be strictly managed:
- Provide mock datasets, sample prompts, and fake evaluations in a central `tests/fixtures/` directory.
- Ensure test isolation by resetting the database and mocks `afterEach` test block.

# Chapter 13 — CI/CD Testing Requirements
Pull Requests must pass the minimum quality gate before merging:
- 100% of Unit and Integration tests (with mocked providers) must pass.
- Linting and documentation validation must pass.
- No live LLM calls are permitted in the automated pipeline.

# Chapter 14 — Testing Checklist
Before marking an AI feature complete, developers must verify:
- **Backend**: Route, Service, and Validation are tested.
- **AI**: Prompt is validated, Provider is mocked, Schema is verified, Error handling and Token logging are asserted.
- **Documentation**: CHANGELOG is updated.
