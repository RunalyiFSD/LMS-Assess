---
Document: API_GUIDELINES.md
Category: Engineering
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: Backend (AI Module)
Related Documents: 
  - ARCHITECTURE.md
  - CODING_STANDARDS.md
Dependencies: None
Last Updated: 2026-07-25
---

# 1. API Design Principles
The AI APIs in LMS-Assess are designed to be predictable, robust, and completely decoupled from LLM provider specifics. Frontend clients should never need to know if the backend is using Gemini, Groq, or OpenAI. All endpoints follow strict RESTful patterns, mandate comprehensive error handling to ensure graceful degradation if AI services fail, and prioritize security against prompt injection.

# 2. AI Endpoint Catalog
The following table outlines the required endpoints for Version 1. *Note: All endpoints currently exist in the repository as routing scaffolding but return a `501 Not Implemented` stub until their target sprint is executed.*

| Endpoint | Method | Purpose | Status | Target Sprint |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/ai/generate/questions` | `POST` | Generate Coding, MCQ, or Theory questions | ✅ Implemented | Sprint 03 |
| `/api/v1/ai/evaluate/coding` | `POST` | Grade a student's coding submission | ✅ Implemented | Sprint 04 |
| `/api/v1/ai/evaluate/mcq` | `POST` | Grade an MCQ submission with explanations | ✅ Implemented | Sprint 04 |
| `/api/v1/ai/evaluate/theory` | `POST` | Grade a theory submission with feedback | ✅ Implemented | Sprint 04 |
| `/api/v1/ai/assess/weak-topics`| `POST` | Analyze student evaluations for weak areas | ✅ Implemented | Sprint 05 |
| `/api/v1/ai/assess/recommendations`| `POST` | Generate personalized learning paths | ✅ Implemented | Sprint 05 |
| `/api/v1/ai/analytics/student` | `POST` | Aggregate student performance metrics | ✅ Implemented | Sprint 05 |
| `/api/v1/ai/analytics/instructor` | `POST` | Aggregate AI accuracy and override metrics | ✅ Implemented | Sprint 05 |

# 3. RESTful Conventions
- **Base Path**: All AI features reside under `/api/v1/ai`.
- **Naming**: Endpoints must use nouns or structured actions (`/generate/questions`), avoiding arbitrary verbs.
- **Methods**: 
  - `POST` must be used for any request that triggers an LLM generation (as these operations are not idempotent and have high token cost).
  - `POST` must also be used for retrieving analytics and historical data instead of `GET`. *Engineering Rationale: Analytics requests require the client to pass large, complex arrays of historical evaluation data. Standard HTTP `GET` requests cannot safely carry large JSON payloads in the request body. Therefore, we deviate from traditional REST data-fetching conventions and utilize `POST` to ensure data integrity during payload transmission.*

# 4. Authentication & Authorization
- **JWT Protection**: All `/api/v1/ai/*` routes must be protected using the core LMS `protect` middleware. Requests missing a valid `Bearer <token>` will be rejected.
- **RBAC**: Endpoints are strictly gated using `restrictTo()`.
  - Question Generation and Analytics: Restricted to `admin` and `instructor`.
  - Evaluations: Can be triggered asynchronously by the system or accessed by `instructor`.

# 5. Request & Response Contracts
All responses must follow a consistent JSON envelope to ensure predictable frontend parsing.

**Success Payload:**
```json
{
  "status": "success",
  "data": {
    "question": "...",
    "difficulty": "medium"
  }
}
```

**Input Validation**: The backend must never trust frontend payloads. All inputs sent to generation or evaluation endpoints must be validated and sanitized to prevent prompt injection attacks.

# 6. Error Handling & Status Codes
The AI module relies on standard HTTP codes mapped directly from custom internal errors.
- `501 Not Implemented`: Returned while endpoints are in the scaffolding phase (Current Repo State).
- `503 Service Unavailable`: Returned instantly if the `.env` variable `AI_ENABLED=false`.
- `504 Gateway Timeout`: Returned if the external LLM provider (`ProviderFactory`) fails to respond within the allowed window.
- `400 Bad Request`: Returned if the frontend provides invalid input or if the LLM output fails schema validation.

**Error Payload:**
```json
{
  "status": "fail",
  "message": "AI Generation failed: LLM timeout"
}
```

# 7. Rate Limiting & Throttling
To protect against Denial of Wallet attacks and excessive token expenditure:
- All `POST` requests to `/api/v1/ai/generate/*` must be strictly throttled (e.g., max 10 requests per minute per instructor).
- Rate limiting middleware must be applied specifically to the `/ai` router, separate from general LMS rate limits.

# 8. Versioning Strategy
The API is currently locked to `v1`. If future requirements necessitate breaking changes to the prompt payloads or JSON contracts, a `/v2/` namespace will be introduced to ensure backward compatibility for legacy clients.
