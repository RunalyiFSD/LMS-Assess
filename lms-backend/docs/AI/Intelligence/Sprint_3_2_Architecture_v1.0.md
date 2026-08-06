# Sprint 3.2: AI Evaluation Platform Architecture Specification (v1.0.0)

```yaml
Version: 1.0.0 (FROZEN ARCHITECTURE SPECIFICATION)
Status: Approved & Frozen for Implementation
Target Sprint: Sprint 3.2
Target Branch: Ai-developement (targeting dev)
Scope: Complete Decoupled AI Evaluation Engine & Instructor Governance
Architect: Chief AI Systems Architect
```

This document establishes the definitive, production-grade architecture for the LMS-Assess AI Evaluation Engine. It strictly decouples submission records from evaluation history, implements an asynchronous orchestration lifecycle, enforces confidence-based human-in-the-loop review, and preserves 100% deterministic scoring boundaries for code execution.

---

## 1. System Topology & Decoupled Data Architecture

```text
Student Submits
        ↓
[Attempt Collection] (Immutable raw submission: text, code, option index)
        ↓
[Evaluation Orchestrator] (Assigns evaluationJobId, enqueues worker)
        ↓
[Evaluation Worker] (Routes question types to deterministic vs AI engines)
        ↓
   ┌───────────────────────┬────────────────────────┐
   │ MCQ Evaluator         │ Theory Evaluator       │ Coding Evaluator
   │ (Deterministic Index) │ (AI Rubric + Conf.)    │ (Hidden Test Cases Pass Rate)
   └───────────────────────┴────────────────────────┴─────────┬──────────────┘
                                                              │ (Optional AI Qualitative Review)
                                                              ▼
[Evaluation Collection] (Standalone: aiScore, confidence, rubricBreakdown, job metadata)
        ↓
[Instructor Review / Override Gate] (approve, override with reason, re-run)
        ↓
[Publish & Notification] (Publish final score to Student, record Analytics)
```

---

## 2. Decoupled Data Models

### 2.1 Attempt Model (`src/models/Attempt.js`)
Stores only raw student submission state and references the active evaluation:

```javascript
const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  
  status: {
    type: String,
    enum: ['draft', 'submitted', 'queued', 'evaluating', 'graded', 'review_required', 'published'],
    default: 'draft'
  },
  
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: null },
  timeTakenSeconds: { type: Number, default: 0 },
  
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
      selectedOptionIndex: { type: Number, default: null },
      submittedCode: { type: String, default: '' },
      language: { type: String, default: 'javascript' },
      submittedText: { type: String, default: '' },
      
      // Reference to the active evaluation document in Evaluation collection
      currentEvaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation', default: null }
    }
  ],
  
  totalMarksObtained: { type: Number, default: 0 },
  isPassed: { type: Boolean, default: false }
}, { timestamps: true });
```

---

### 2.2 Evaluation Model (`src/models/Evaluation.js` - NEW STANDALONE COLLECTION)
Stores granular AI telemetry, confidence, rubrics, manual overrides, and full audit logs:

```javascript
const evaluationSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true, index: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  
  questionType: { type: String, enum: ['mcq', 'coding', 'theory'], required: true },
  
  // Asynchronous Job Metadata
  evaluationJobId: { type: String, required: true, index: true },
  jobStatus: {
    type: String,
    enum: ['queued', 'evaluating', 'completed', 'failed', 'review_required'],
    default: 'queued'
  },
  queuedAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  completedAt: { type: Date },
  
  // Scoring Tiers
  maxMarks: { type: Number, required: true },
  aiScore: { type: Number, default: 0 },
  manualScore: { type: Number, default: null },
  finalScore: { type: Number, required: true, default: 0 },
  
  // AI Confidence & Human-in-the-Loop
  confidence: { type: Number, default: 1.0 }, // 0.0 to 1.0
  reviewRequired: { type: Boolean, default: false },
  reviewReason: { type: String, default: null },
  
  // Detailed Feedback & Rubric Breakdown
  feedback: { type: String, default: '' },
  rubricBreakdown: [
    {
      criterion: String,
      maxPoints: Number,
      awardedPoints: Number,
      feedback: String
    }
  ],
  
  // Coding Deterministic Execution Results
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  codeAnalysis: {
    timeComplexity: String,
    spaceComplexity: String,
    styleFeedback: String,
    edgeCases: [String]
  },
  
  // Instructor Override & Governance
  isOverridden: { type: Boolean, default: false },
  overrideReason: {
    type: String,
    enum: ['Too strict', 'Accepted alternate answer', 'Rubric changed', 'Partial credit adjustment', 'Other', null],
    default: null
  },
  overrideComment: { type: String, default: '' },
  overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  overriddenAt: { type: Date, default: null },
  
  // Versioning & Telemetry Reproducibility
  promptVersion: { type: String, default: '1.2.0' },
  promptHash: { type: String, default: 'none' },
  rubricVersion: { type: String, default: '1.0.0' },
  provider: { type: String, default: 'groq' },
  model: { type: String, default: 'llama-3.1-8b-instant' },
  latencyMs: { type: Number, default: 0 },
  retryCount: { type: Number, default: 0 },
  estimatedCostUsd: { type: Number, default: 0 }
}, { timestamps: true });

evaluationSchema.index({ attemptId: 1, questionId: 1 });
```

---

## 3. Evaluation Lifecycle & State Transitions

```text
[DRAFT]
   │
   │ (Student clicks 'Submit Exam')
   ▼
[SUBMITTED] ➔ Attempt persisted (<100ms)
   │
   │ (Orchestrator generates evaluationJobId)
   ▼
[QUEUED]
   │
   │ (Worker picks up job)
   ▼
[EVALUATING]
   │
   ├──────────────────────────────┬──────────────────────────────┐
   ▼                              ▼                              ▼
(MCQ Deterministic)        (Coding Execution)            (Theory AI Evaluator)
Direct Index Compare       Test Cases Pass Rate          Rubric Scored + Confidence
   │                              │                              │
   │                              │ (Optional Style AI)          │
   └──────────────────────────────┴──────────────────────────────┘
                                  │
                                  ▼
                     [Confidence < 0.60?]
                     ├─── YES ───► [REVIEW_REQUIRED] (Flagged for instructor)
                     └─── NO  ───► [GRADED]
                                       │
                                       │ (Instructor Reviews / Overrides)
                                       ▼
                                  [PUBLISHED] (Marks released to student)
```

---

## 4. Dedicated Evaluation API Specification

All evaluation operations are accessed via dedicated `/api/v1/evaluations` endpoints:

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/evaluations/attempt/:attemptId` | Student / System | Enqueue asynchronous evaluation job for an attempt. |
| `GET` | `/api/v1/evaluations/attempt/:attemptId` | Student / Instructor | Fetch current evaluation records and scores for an attempt. |
| `GET` | `/api/v1/evaluations/history/:attemptId/:questionId` | Instructor | Retrieve full evaluation audit history for a specific question. |
| `POST` | `/api/v1/evaluations/:id/approve` | Instructor | Approve AI-generated score and clear `reviewRequired` flag. |
| `POST` | `/api/v1/evaluations/:id/override` | Instructor | Manually override score with required structured reason. |
| `POST` | `/api/v1/evaluations/:id/rerun` | Instructor | Re-run AI evaluation using current prompt and rubric version. |
| `POST` | `/api/v1/evaluations/attempt/:attemptId/publish` | Instructor | Publish finalized grades to the student and trigger notifications. |

---

## 5. Phased Sprint 3.2 Implementation Modules

```text
Module 1: Domain & Schema Isolation
- Create `src/models/Evaluation.js` standalone collection.
- Refactor `src/models/Attempt.js` to reference `currentEvaluationId`.
- Add MongoDB indexes for attempt/question lookups.

Module 2: Theory Evaluation Pipeline
- Build `evaluation/theory.txt` prompt template (v1.2.0) with multi-criteria rubric & confidence output.
- Implement Two-Pass Schema Validation in `evaluationService.js`.
- Add confidence threshold rule (`confidence < 0.60` -> `reviewRequired = true`).

Module 3: Coding Evaluation Pipeline
- Build deterministic test case runner (hidden test cases -> pass percentage -> score).
- Build qualitative AI code reviewer for time/space complexity and style analysis.
- Strictly isolate pass/fail logic from LLM generation.

Module 4: Dedicated Evaluation API & Controller
- Implement `src/ai/controllers/evaluationController.js` dedicated REST endpoints (`approve`, `override`, `rerun`, `publish`).
- Mount routes under `src/routes/evaluationRoutes.js`.

Module 5: Evaluation Orchestrator & Worker
- Create `src/ai/orchestrator/evaluationOrchestrator.js` to manage asynchronous queueing, timeouts, retries, and publish hooks.

Module 6: Automated Test Suite & Documentation Synchronization
- Comprehensive unit, integration, and chaos resilience tests for all evaluation pipelines.
- Synchronize `CANONICAL_ENGINEERING_BRAIN.md`, `API_INDEX.md`, and `DATABASE_INDEX.md`.
```

---

## 6. Definition of Done (DoD) for Sprint 3.2

1. **Decoupled Persistence**: `Evaluation` records stored in standalone collection with 0 document bloat in `Attempt`.
2. **Theory Rubric Evaluation**: Theory essays scored with multi-criteria rubrics, structured point breakdown, and confidence metric.
3. **Deterministic Coding**: Code scored 100% deterministically via test cases; AI provides only qualitative explanation and complexity feedback.
4. **Human-in-the-Loop Governance**: Low confidence (< 0.60) flags `reviewRequired`; instructors can approve, override with reason, or re-run.
5. **Dedicated APIs**: Evaluation routes mounted and functioning with JWT auth and role guards.
6. **Reproducibility**: `promptVersion` (v1.2.0), `promptHash`, `rubricVersion` (v1.0.0), model, and latency logged for every evaluation.
7. **Zero Core LMS Regressions**: Student assessment flow, question bank, and authentication completely unaffected.
8. **Automated Test Coverage**: 100% pass rate on evaluation test suites.
