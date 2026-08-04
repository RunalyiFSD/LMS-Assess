# Sprint History

Historical and forward-looking record of sprints, goals, completed features, lessons learned, and remaining dependencies.

## Sprint 1: AI Foundation
- **Status**: Completed
- **Completed Deliverables**:
  - `ProviderFactory` architecture implemented.
  - Prompt Registry built.
  - AI Providers (Gemini, Groq) linked.
  - Base Configuration finalized.
- **Lessons Learned**: The Provider abstraction works effectively for seamless model switching.

## Sprint 2: Question Generation & Instructor Workflows
- **Status**: Completed
- **Completed Deliverables**:
  - Generation API (`/api/v1/ai/generate/questions`).
  - Generation UI (`QuestionGeneration.jsx`).
  - Response Normalization logic.
  - Question Review Toolbar & Draft persistence.
  - Save to Question Bank integration.
- **Lessons Learned**: LLM schemas require strict validation constraints. Difficulty enums must normalize gracefully.

## Sprint 3.1: AI Platform Hardening & Stabilization
- **Status**: Completed
- **Completed Deliverables**:
  - Safe service deprecation (`QuestionGenerationService.deprecated.js`, `TheoryEvaluationService.deprecated.js`).
  - Markdown stripping & robust JSON extraction (`JsonExtractor.js`).
  - Provider retry logic with exponential backoff for 429/500/503 errors.
  - Two-Pass JSON Schema Validation (Raw + Canonical).
  - Enhanced Health check reporting runtime status, auth, retries, and failures.
  - Prompt versioning (`v1.1.0`) and SHA-256 checksum tracking.
  - Deep Telemetry logging (`AILogger`) with failure taxonomy and cost calculation.
  - Automated test suite (`tests/ai/`) passing 100%.
- **Lessons Learned**: Prompt-level JSON framing combined with regex boundary extraction prevents provider hallucination and schema drift.

## Sprint 3.2: AI Evaluation Engine
- **Status**: Ready to Begin
- **Scope & Objectives**: 
  - Automated Theory evaluation with multi-criteria rubrics.
  - Automated Coding challenge evaluation with test case pass/fail verification.
  - Student attempt evaluation pipeline.
  - Result persistence in MongoDB (`AIEvaluationLog` / `AssessmentResult`).
