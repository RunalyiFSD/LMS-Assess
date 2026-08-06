# Database Index

Documentation of every Mongoose model, its purpose, relationships, and referencing controllers.

## Core Models

### `Assessment.js`
- **Purpose**: Defines the structure of an examination or assignment.
- **Relationships**: Refers to `Subject`, embeds or relates to `Question` schemas.
- **Controllers**: `assessmentController.js`, `attemptController.js`
- **Indexes**: Indexed by `subject` and `type` for quick filtering.

### `Attempt.js`
- **Purpose**: Tracks a student's active or completed test session.
- **Relationships**: Refers to `User` (student), `Assessment`.
- **Controllers**: `attemptController.js`, `evaluationController.js`
- **Status Enum**: `started`, `submitted`, `graded`

### `Result.js`
- **Purpose**: Stores the final graded output of an Attempt.
- **Relationships**: Refers to `User`, `Assessment`, `Attempt`.
- **Controllers**: `assessmentController.js`, `evaluationController.js`

## Question Bank Models

### `CodingQuestion.js`, `MCQQuestion.js`, `TheoryQuestion.js`
- **Purpose**: Domain-specific question structures.
- **Relationships**: Can be embedded or linked via ObjectIds in `Assessment` arrays.
- **Controllers**: `questionController.js`, `generationController.js`

## AI Models

### `AIEvaluationLog.js`
- **Purpose**: Tracks AI-driven grading events for auditing and instructor override.
- **Relationships**: Links to `Attempt` and `User`.

### `AIUsageMetrics.js`
- **Purpose**: Logs token usage and latency for Groq/Gemini API calls.

### `PromptTemplate.js`
- **Purpose**: Database fallback or override for file-based `.txt` prompts (if dynamic prompt editing is supported).
