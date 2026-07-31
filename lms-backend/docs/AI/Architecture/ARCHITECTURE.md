---
Document: ARCHITECTURE.md
Category: Architecture
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: AI V1
Related Documents: 
  - MASTER_GUIDE.md
  - ROADMAP.md
Dependencies: ROADMAP.md
Last Updated: 2026-07-25
---

# 1. System Overview
LMS-Assess is a robust, role-based Learning Management System designed to facilitate educational assessments. The AI module operates as an intelligent enhancement layer over this existing system, providing automated question generation, submission evaluation, and learning analytics. The architecture is strictly decoupled, ensuring that the core LMS functions autonomously even if AI services are unavailable or disabled.

# 2. Repository Structure
The backend repository is organized by domain responsibilities, strictly isolating the AI module from core LMS logic.
```text
lms-backend/
├── src/
│   ├── ai/          # Isolated AI Module
│   ├── controllers/ # Standard LMS Controllers
│   ├── models/      # Mongoose Schemas (Standard + AI)
│   ├── routes/      # Express Routes
│   ├── middleware/  # Auth, Error, Rate Limiting
│   └── config/      # Environment variables
└── docs/AI/         # Engineering Handbook
```

# 3. Existing LMS Architecture
The core LMS is built on a standard Node.js and Express.js stack handling RESTful API requests. MongoDB (via Mongoose) stores all relational data. Authentication is handled via stateless JWTs utilizing a `protect` middleware. Authorization enforces strict role-based access control (RBAC) via a `restrictTo('admin', 'instructor', 'student')` middleware, which is critical for securing AI endpoints against unauthorized execution.

# 4. AI Module Overview
The AI module (`src/ai`) is built as a highly cohesive, loosely coupled subsystem. It follows a strict dependency hierarchy: `Routes -> Controllers -> Services -> ProviderFactory -> Provider`. No LMS business logic accesses an AI provider directly; everything must pass through the abstracted services to ensure the core system remains oblivious to the underlying LLM implementations.

# 5. AI Module Directory Structure
```text
src/ai/
├── controllers/ # Handles HTTP request/response for AI endpoints
├── errors/      # Custom AI-specific error classes (e.g., NotImplementedError)
├── prompts/     # .txt files and the registry for loading them
├── providers/   # LLM integrations (Gemini, Groq) and the ProviderFactory
├── routes/      # API definitions mapping to controllers
├── services/    # Core AI business logic (Evaluation, Generation)
└── utils/       # Specialized AI utilities (e.g., AILogger)
```

# 6. Provider Architecture
To prevent vendor lock-in, the system relies entirely on a Factory Pattern for LLM access. 
- **`BaseProvider`**: An abstract interface defining the contract.
- **`ProviderFactory`**: Instantiates the correct provider (`GeminiProvider`, `GroqProvider`) based on the `AI_PROVIDER` environment variable.
Controllers and Services interact *only* with the `ProviderFactory`. Currently, Gemini and Groq integrations are scaffolded and awaiting prompt engine integration.

# 7. Prompt Architecture *(Planned - V1)*
Prompts will not be hardcoded into JavaScript logic. 
Instead, raw prompts will be stored as `.txt` files in `src/ai/prompts/`. A centralized Prompt Engine will load these files and inject dynamic variables (e.g., `{{student_answer}}`, `{{topic}}`) at runtime. This allows prompts to be versioned, reviewed, and optimized independently of the core TypeScript/JavaScript execution logic.

# 8. Question Generation Pipeline *(Planned - V1)*
**Data Flow**:
1. An instructor requests a new question for a specific topic and difficulty.
2. The request passes the `protect` and `restrictTo('instructor')` middleware.
3. `QuestionGenerationService` fetches the relevant Prompt Template.
4. `ProviderFactory` queries the active LLM.
5. The LLM returns a strictly formatted JSON object representing the Coding, MCQ, or Theory question.
6. The Controller returns the parsed JSON to the frontend for review.

# 9. Evaluation Pipeline *(Planned - V1)*
**Data Flow**:
1. A student submits an assessment answer.
2. The standard LMS saves the raw submission to MongoDB.
3. An asynchronous event triggers the `EvaluationService`.
4. The service constructs an evaluation prompt containing the question, rubric, and the student's answer.
5. The LLM generates a numerical score, qualitative feedback, and improvement suggestions.
6. Results are saved to the `AIEvaluationLog` model and linked to the student's submission.

# 10. Learning Assessment Pipeline *(Planned - V1)*
**Data Flow**:
1. An instructor or student requests a performance breakdown dashboard.
2. The system aggregates historical `AIEvaluationLog` data for that specific student.
3. The AI service analyzes the aggregated data to detect recurring errors and flag "Weak Topics".
4. The system generates targeted learning recommendations and stores them in the `StudentLearningPath` model.

# 11. Analytics Pipeline *(Planned - V1)*
To monitor systemic health, every LLM request logs token usage and latency to the `AIUsageMetrics` model. Additionally, whenever an instructor overrides an AI-generated grade, the discrepancy is tracked. These metrics are aggregated to provide administrative dashboards detailing AI reliability, platform costs, and provider latency.

# 12. Data Models & Storage
All AI-specific schemas reside alongside standard models in `src/models/` but remain structurally decoupled.
- **`AIEvaluationLog`**: Tracks individual grading decisions.
- **`AIUsageMetrics`**: Tracks token usage and API latency.
- **`StudentLearningPath`**: Stores AI-generated recommendations.
- **`ConversationHistory`**: (Scaffolded for future use).
- **`KnowledgeDocument`**: (Scaffolded for future RAG).
- **`PromptTemplate`**: Tracks prompt versions used for evaluations.

# 13. Security & Permissions
All `/api/v1/ai/*` routes are heavily protected by JWT authentication.
Role limits dictate that destructive actions and Question Generation are strictly restricted to `admin` or `instructor` roles. Furthermore, all user inputs passed to the LLM (like student code submissions) must undergo rigorous sanitization to prevent prompt injection attacks from manipulating the evaluation outcome.

# 14. Error Handling & Logging
The system employs a Strategy-pattern logger (`AILogger`). Currently, it is configured to use the `ConsoleAILogger`, with a `MongoAILogger` planned for production deployment. The architecture mandates graceful degradation: if the `ProviderFactory` fails or times out, the API returns a standardized error shape, and the core LMS must continue functioning (e.g., reverting to manual grading workflows).

# 15. Configuration Management
The AI module's behavior is dictated by `.env` variables:
- `AI_ENABLED`: A master kill switch. If set to `false`, all AI endpoints immediately return 503 Service Unavailable.
- `AI_PROVIDER`: Determines which provider the Factory instantiates (e.g., `gemini`, `groq`).
- API Keys (`GEMINI_API_KEY`, etc.) are securely loaded at runtime and never hardcoded.

# 16. Extension Points (Future Work)
This architecture is explicitly designed to accommodate post-V1 features without requiring structural refactoring:
- **RAG (Retrieval-Augmented Generation)**: Will plug into the `ProviderFactory` by passing `KnowledgeDocument` embeddings alongside prompts.
- **AI Tutor**: Will utilize the `ConversationHistory` model and plug into a new dedicated `TutorService`.
- **Multi-Agent Systems**: Can be orchestrated by layering specialized agent services on top of the existing abstract `BaseProvider`.
