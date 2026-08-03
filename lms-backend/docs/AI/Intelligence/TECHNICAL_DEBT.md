# Technical Debt

A verified log of current bugs, code duplication, and required refactors.

## Deprecated Legacy Services (Tracked for Sprint 3.2 Removal)

### 1. Generation Services
- **Files**: `src/ai/services/QuestionGenerationService.deprecated.js`
- **Status**: Formally deprecated in Sprint 3.1 with `@deprecated` annotation. Verified 0 active imports.
- **Action for Sprint 3.2**: Delete permanently once Sprint 3.2 is stabilized.

### 2. Evaluation Services
- **Files**: `src/ai/services/TheoryEvaluationService.deprecated.js`
- **Status**: Formally deprecated in Sprint 3.1 with `@deprecated` annotation.
- **Action for Sprint 3.2**: Delete permanently during AI Evaluation Engine implementation.

## Resolved in Sprint 3.1 (AI Platform Hardening)

- [x] **Groq JSON Extraction & Stripping**: Implemented `JsonExtractor` to safely strip markdown code blocks and extract JSON boundaries.
- [x] **Two-Pass Validation Pipeline**: Added Raw Schema Validation (Pass 1) and Canonical Database Validation (Pass 2) in `generationService.js`.
- [x] **Provider Resilience & Retries**: Added exponential backoff retry for transient 429/500/503 errors and network timeouts in `GroqProvider.js` and `GeminiProvider.js`.
- [x] **Deep Telemetry & Observability**: Integrated durationMs, token tracking, prompt checksums, cost calculation, and failure taxonomy in `AILogger.js`.
- [x] **Enhanced Health Telemetry**: Added latency, status, auth, retries, and failure counters to `GET /api/v1/ai/health`.
- [x] **Prompt Versioning**: Implemented prompt version tagging (`v1.1.0`) and SHA-256 hash tracking in `PromptRegistry.js`.
- [x] **Automated Test Coverage**: Created `tests/ai/` suite covering JSON extraction, prompt interpolation, and AI resilience.
