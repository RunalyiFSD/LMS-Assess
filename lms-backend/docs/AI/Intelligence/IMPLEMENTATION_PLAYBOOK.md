# LMS-Assess Implementation Playbook

This document is the standard development manual for all future engineering work in the LMS-Assess codebase. Every new feature, endpoint, component, or AI enhancement must follow these exact protocols.

---

## 1. How to Add a New Feature

1. **Check Canonical Engineering Brain**: Query `CANONICAL_ENGINEERING_BRAIN.md` to identify dependencies, models, routes, and risk levels.
2. **Update Intelligence Before Implementation**:
   - Add feature specifications to `FEATURE_REGISTRY.md`.
   - Update `DEPENDENCY_GRAPH.md`.
   - Update `IMPLEMENTATION_STATUS.md`.
3. **Design & Plan**: Create an implementation plan detailing frontend, backend, and database changes.
4. **Implement Backend**:
   - Model -> Controller -> Service -> Route -> Route Mounting (`routes/index.js`).
5. **Implement Frontend**:
   - Service / API client (`services/`) -> Sub-components (`components/`) -> Page view (`pages/`).
6. **Verify & Test**: Run testing matrix (Unit, Integration, E2E manual).
7. **Document & Release**: Update `CANONICAL_ENGINEERING_BRAIN.md` and follow `RELEASE_CHECKLIST.md`.

---

## 2. How to Add a Controller & Route

### Adding a Backend Controller
1. Place standard LMS controllers in `src/controllers/<name>Controller.js`.
2. Place AI-specific controllers in `src/ai/controllers/<name>Controller.js`.
3. Follow the standard async error handling wrapper pattern:
```javascript
// Example Controller Structure
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const AppError = require('../utils/AppError');

exports.myAction = asyncHandler(async (req, res, next) => {
  // 1. Validate inputs
  const { data } = req.body;
  if (!data) return next(new AppError('Data is required', 400));

  // 2. Call service layer
  const result = await myService.process(data);

  // 3. Return canonical response
  res.status(200).json({
    status: 'success',
    data: result,
  });
});
```

### Adding and Mounting a Route
1. Define endpoints in `src/routes/<domain>Routes.js` (or `src/ai/routes/aiRoutes.js`).
2. Apply appropriate middleware: `protect`, `restrictTo('admin', 'instructor', 'student')`, and rate limiters (`authLimiter`, `aiLimiter`, `globalLimiter`).
3. Mount the route inside `src/routes/index.js`.
4. Update `API_INDEX.md` and `MODULE_INDEX.md`.

---

## 3. How to Add a Mongoose Model

1. Define the schema in `src/models/<ModelName>.js`.
2. Add comprehensive validation rules, default values, and timestamps:
```javascript
const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    // Define exact relationships with refs
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  },
  { timestamps: true }
);

// Add explicit indexes for foreign keys & frequent query filters
schema.index({ subject: 1 });

module.exports = mongoose.model('ModelName', schema);
```
3. Update `DATABASE_INDEX.md` with schema fields, relationships, and referencing controllers.

---

## 4. How to Add a Frontend Page & Component

1. **API Service**: Define API methods in `src/services/<domain>Service.js` (e.g. `src/services/aiService.js` or `src/services/api.js`).
2. **Components**:
   - Place reusable UI components in `src/components/common/`.
   - Place domain-specific components in their respective directory (e.g., `src/components/ai/`, `src/components/dashboard/`).
   - Break large page files into subcomponents (<250 lines each).
3. **Page**: Add the top-level route view in `src/pages/<PageName>.jsx` and connect routing in `src/App.jsx`.
4. **State & Error Handling**: Implement explicit loading states, empty states, error states, and success notifications. Never use synthetic `setTimeout` delays in production.

---

## 5. How to Add an AI Provider

1. Inherit from `BaseProvider` inside `src/ai/providers/BaseProvider.js`.
2. Implement required contract methods:
   - `generate(prompt, options)`
   - `healthCheck()`
3. Ensure strict schema enforcement or prompt-level JSON framing so output conforms to the canonical JSON schema.
4. Register the new provider in `src/ai/providers/ProviderFactory.js`.
5. Update `src/ai/constants/providers.js` and `src/ai/constants/models.js`.
6. Update `FEATURE_REGISTRY.md` and `PROJECT_KNOWLEDGE_GRAPH.md`.

---

## 6. How to Add an AI Prompt Template

1. Store the prompt as a raw text file in `src/ai/prompts/<category>/<prompt_name>.txt`.
2. Clearly define placeholder variables with `{{variableName}}` syntax.
3. Explicitly define the mandatory JSON output structure within the prompt text.
4. Register the template path in `src/ai/prompts/registry.js`.
5. Test loading and variable injection before calling the provider.

---

## 7. Required PR & Branch Workflow

1. **Branch Format**: `feature/<module>-<description>` branching off `Ai-developement` (for AI features) or `dev` (for core LMS).
2. **Commit Standard**: Semantic commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).
3. **Testing Gate**: Must pass all automated checks and manual testing matrix steps.
4. **PR Checklist**:
   - [ ] No hardcoded secrets or `.env` files.
   - [ ] Canonical Engineering Brain updated.
   - [ ] Feature Registry & Dependency Graph synchronized.
   - [ ] Code follows `CODING_STANDARDS.md`.
   - [ ] Merged cleanly into `dev` -> ready for release testing.
