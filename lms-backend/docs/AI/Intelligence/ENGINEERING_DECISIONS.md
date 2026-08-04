# Engineering Decision Records (EDRs)

Architectural memory capturing the rationale, trade-offs, and context behind major technical decisions across the LMS-Assess platform.

---

### EDR-001: Why MongoDB?
- **Context**: The assessment system requires a highly flexible schema to store diverse and deeply structured question formats (MCQs with multiple options/explanations, Coding questions with starter code/test cases, Theory questions with rubrics).
- **Alternatives Considered**: PostgreSQL (relational JSONB), Supabase.
- **Decision**: MongoDB (via Mongoose ODM).
- **Rationale**: Direct document model support for polymorphic question structures without requiring multi-table JOINs on high-frequency assessment lookups.
- **Date**: Sprint 0
- **Status**: Accepted
- **Related Files**: `User.js`, `Assessment.js`, `MCQQuestion.js`, `CodingQuestion.js`, `TheoryQuestion.js`

---

### EDR-002: Why ProviderFactory?
- **Context**: AI models and vendors (Groq, Google Gemini, OpenAI, Anthropic) frequently change pricing, context limits, and model availability.
- **Alternatives Considered**: Direct inline SDK calls (`@google/genai` or `groq-sdk` directly in services).
- **Decision**: Implement a Factory & Strategy Pattern (`ProviderFactory.js` + `BaseProvider.js`).
- **Rationale**: Isolates LLM communication behind a single uniform interface (`generate()`, `healthCheck()`), allowing zero-downtime provider switching via configuration.
- **Date**: Sprint 1
- **Status**: Accepted
- **Related Files**: `ProviderFactory.js`, `BaseProvider.js`, `GroqProvider.js`, `GeminiProvider.js`

---

### EDR-003: Why Prompt Registry?
- **Context**: Hardcoding multi-paragraph prompt templates in JavaScript controller/service files leads to merge conflicts, poor readability, and inability to version or test prompts independently.
- **Alternatives Considered**: Inline template strings in service files.
- **Decision**: Store prompts as `.txt` files in categorized directories managed by `registry.js`.
- **Rationale**: Centralized prompt versioning, decoupled business logic, easy variable injection (`{{topic}}`), and isolated prompt testing.
- **Date**: Sprint 1 / 2
- **Status**: Accepted
- **Related Files**: `src/ai/prompts/registry.js`, `src/ai/prompts/*`

---

### EDR-004: Why Three Distinct Question Models?
- **Context**: MCQs, Coding Challenges, and Theory questions have completely distinct validation rules, subdocuments, and execution requirements.
- **Alternatives Considered**: A single generic `Question` model with a loosely typed `metadata` or `content` object.
- **Decision**: Create three dedicated Mongoose models: `MCQQuestion.js`, `CodingQuestion.js`, and `TheoryQuestion.js`.
- **Rationale**: Enforces strict Mongoose schema validation at the database level for each question type (e.g., ensuring `options` has 4 items and `testCases` has input/output).
- **Date**: Sprint 0 / 2
- **Status**: Accepted
- **Related Files**: `MCQQuestion.js`, `CodingQuestion.js`, `TheoryQuestion.js`

---

### EDR-005: Why Branching Strategy (`first_layer` -> `Ai-developement` -> `dev` -> `main`)?
- **Context**: High-velocity development involving UI updates, core LMS fixes, and experimental AI integration risked destabilizing the main working branch.
- **Alternatives Considered**: Direct commits to `dev` or single feature branches.
- **Decision**: Establish a staged merge pipeline where experimental work (`first_layer`) is consolidated into `Ai-developement`, then integrated with frontend/backend in `dev`, before tagging `main`.
- **Rationale**: Guarantees that `dev` is always stable and ready for QA, isolating non-deterministic AI development.
- **Date**: Stabilization Phase
- **Status**: Accepted
- **Related Files**: `BRANCH_HISTORY.md`, `RELEASE_STRATEGY.md`

---

### EDR-006: Why Sequential Save for Generated Questions?
- **Context**: When generating 5-10 questions simultaneously via AI, bulk inserting or parallel asynchronous saves without proper sequencing led to MongoDB write race conditions and partial failures.
- **Alternatives Considered**: `Promise.all()` concurrent writes.
- **Decision**: Implement sequential iteration with individual try/catch blocks during question bank ingestion.
- **Rationale**: Ensures atomic persistence and allows the frontend to receive precise error reporting for any single invalid question without failing the entire batch.
- **Date**: Sprint 2
- **Status**: Accepted
- **Related Files**: `generationService.js`, `questionController.js`

---

### EDR-007: Why Canonical Difficulty Normalization?
- **Context**: LLMs generate varying casing or synonyms for difficulty levels (e.g., "easy", "Easy", "EASY", "beginner"), causing Mongoose enum validation errors (`enum: ['easy', 'medium', 'hard']`).
- **Alternatives Considered**: Relaxing Mongoose enum validators to plain strings.
- **Decision**: Implement strict backend normalization in the service layer before Mongoose ingestion.
- **Rationale**: Preserves strict database schema integrity while accommodating non-deterministic LLM output variations.
- **Date**: Sprint 2
- **Status**: Accepted
- **Related Files**: `generationService.js`, `aiSchemaMapper.js`

---

### EDR-008: Why Canonical Engineering Brain?
- **Context**: As the repository grew to 20+ models, 22 frontend pages, and multiple AI providers, partial AI memory and ad-hoc documentation resulted in conflicting implementations and broken assumptions.
- **Alternatives Considered**: Standard static markdown docs or external wikis.
- **Decision**: Build a versioned, repo-bound `CANONICAL_ENGINEERING_BRAIN.md` and 15 supporting intelligence registries that must be consulted and updated for every engineering task.
- **Rationale**: Ensures complete architectural alignment, prevents duplicate services, guarantees verification against live code, and provides a permanent, verified engineering brain.
- **Date**: Stabilization Phase / Sprint 3.0
- **Status**: Accepted
- **Related Files**: `CANONICAL_ENGINEERING_BRAIN.md`, `Intelligence/*`
