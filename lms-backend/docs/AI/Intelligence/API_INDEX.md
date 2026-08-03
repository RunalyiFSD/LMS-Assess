# API & Controller Index

Comprehensive registry of all controllers and routes, their responsibilities, validation logic, and dependencies.

## Assessment Module APIs

### `assessmentController.js`
- **Responsibilities**: Create, Read, Update, Delete assessments.
- **Routes**: `assessmentRoutes.js`
  - `GET /api/v1/assessments`
  - `POST /api/v1/assessments`
  - `PUT /api/v1/assessments/:id`
  - `DELETE /api/v1/assessments/:id`
- **Services Called**: `assessmentService.js` (Core logic for Assessment mapping).
- **Security**: Protected by JWT. `POST`/`PUT`/`DELETE` restricted to Admin/Instructor.
- **Dependencies**: `Assessment` model, `Subject` model.

### `attemptController.js`
- **Responsibilities**: Manage student sessions (Start, Auto-Save, Submit).
- **Routes**: `attemptRoutes.js`
- **Services Called**: `evaluationService.js` (triggered upon submission).
- **Security**: Protected by JWT. Restricted to Students (start/submit) and Instructors (view).
- **Dependencies**: `Attempt`, `Result`, `Assessment`.

## AI Platform APIs

### `generationController.js`
- **Responsibilities**: Validate requests and trigger AI question generation.
- **Routes**: `aiRoutes.js` (`POST /api/v1/ai/generate/questions`)
- **Services Called**: `generationService.js`, `QuestionGenerationService.js` (Duplicate to be merged).
- **Security**: JWT, Instructor/Admin only.
- **Dependencies**: `ProviderFactory`.

### `evaluationController.js`
- **Responsibilities**: Process submitted answers against a grading rubric using LLMs.
- **Routes**: `aiRoutes.js` (`POST /api/v1/ai/evaluate`)
- **Services Called**: `evaluationService.js`, `CodingEvaluationService.js`, `TheoryEvaluationService.js`
- **Security**: Internal trigger / Instructor override.
- **Dependencies**: `Attempt`, `AIEvaluationLog`.
