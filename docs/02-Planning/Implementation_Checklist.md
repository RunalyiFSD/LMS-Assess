# LMS-Assess — Living Implementation Checklist

> **Document Type:** Living Document — updated continuously as development progresses.
> **Source of Truth:** Master Project Documentation (docs/01-Architecture/)
> **Version:** 1.0 | **Started:** 2026-07-17

---

## Project Canon (Locked Decisions)

| Topic | Decision |
|-------|----------|
| Database | ✅ Supabase PostgreSQL — MongoDB removed |
| Authentication | ✅ Supabase Auth + JWT |
| Role Naming | ✅ `student` · `teacher` · `admin` |
| AI Platform | ✅ Same monorepo → `ai-platform/` |
| Testing | ✅ Tests written alongside each sprint |
| Sprint 9 | ✅ Regression, load, security, perf, e2e — NOT first tests |

---

## Feature Development Lifecycle (Mandatory for Every Task)

```
Requirement → Architecture Check → Implementation Plan
→ Code → Unit Tests → Integration Tests
→ Manual Testing → Documentation Update → Git Commit → Next Feature
```

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | TODO — not started |
| `[/]` | IN PROGRESS |
| `[x]` | DONE |
| `[!]` | BLOCKED — needs resolution |
| `[-]` | DEFERRED — moved out of this sprint |

---

## Sprint Overview

| Sprint | Focus | Status |
|--------|-------|--------|
| 1A | Architecture Alignment | `[ ]` |
| 1B | Foundation Verification | `[ ]` |
| 2 | Authentication & User Management | `[ ]` |
| 3 | Course Management | `[ ]` |
| 4 | Assessment Module | `[ ]` |
| 5 | AI Platform Foundation | `[ ]` |
| 6 | RAG & ChromaDB | `[ ]` |
| 7 | AI Features | `[ ]` |
| 8 | Notifications & Dashboards | `[ ]` |
| 9 | Testing, Security & Optimization | `[ ]` |
| 10 | Deployment & Production Release | `[ ]` |

---

---

## Sprint 1A — Architecture Alignment

> **Goal:** Align the existing repository to the documented architecture before any feature work begins.
> **Layer:** Infrastructure / All
> **Sprint Status:** `[ ]`

### 1. Repository Structure

- [ ] Create `docs/02-Planning/` directory *(this file)*
- [ ] Create `ai-platform/` directory at repo root
- [ ] Create `ai-platform/README.md` with placeholder content
- [ ] Create `docker-compose.yml` at repo root (stub: frontend/backend/ai-platform/db services)
- [ ] Create root-level `README.md` describing all services
- [ ] Create `.env.example` at repo root listing all required environment variables

### 2. Remove MongoDB from Architecture

- [ ] Remove `mongoose` dependency from `lms-backend/package.json`
- [ ] Remove `lms-backend/src/config/db.js` (MongoDB connection)
- [ ] Remove all Mongoose model files from `lms-backend/src/models/`:
  - [ ] `User.js`
  - [ ] `Assessment.js`
  - [ ] `Attempt.js`
  - [ ] `CodingQuestion.js`
  - [ ] `MCQQuestion.js`
  - [ ] `TheoryQuestion.js`
  - [ ] `Leaderboard.js`
  - [ ] `Notification.js`
  - [ ] `Result.js`
  - [ ] `Subject.js`
- [ ] Remove `lms-backend/src/utils/mockSeeder.js`
- [ ] Remove `lms-backend/src/utils/seed.js`
- [ ] Remove `lms-backend/src/utils/diagnostics.js`
- [ ] Update `lms-backend/src/server.js` — remove MongoDB connection call
- [ ] Run `npm install` in `lms-backend/` to clean lockfile

### 3. Configure Supabase in Backend

- [ ] Install Supabase client: `npm install @supabase/supabase-js` in `lms-backend/`
- [ ] Create `lms-backend/src/config/supabase.js` — initialize Supabase client
- [ ] Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `lms-backend/.env`
- [ ] Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `lms-frontend/.env`
- [ ] Add all new env vars to root `.env.example`

### 4. Backend Folder Structure Alignment

- [ ] Create `lms-backend/src/repositories/` directory
- [ ] Create `lms-backend/src/validators/` directory
- [ ] Create `lms-backend/src/constants/` directory
- [ ] Create `lms-backend/src/helpers/` directory
- [ ] Create `lms-backend/src/integrations/` directory
- [ ] Create `lms-backend/src/jobs/` directory
- [ ] Create `lms-backend/src/constants/roles.js` — export `ROLES = { STUDENT, TEACHER, ADMIN }`
- [ ] Create `lms-backend/src/constants/httpStatus.js` — export common HTTP status codes

### 5. Role Naming Standardization (instructor → teacher)

- [ ] Audit all occurrences of `instructor` in `lms-backend/src/`
- [ ] Replace in backend:
  - [ ] `authController.js`
  - [ ] `userController.js`
  - [ ] `roleMiddleware.js`
  - [ ] All route files
- [ ] Audit `lms-frontend/src/` for `instructor` role references
- [ ] Replace in frontend:
  - [ ] `AuthContext.jsx`
  - [ ] `App.jsx` (allowedRoles props)
  - [ ] Dashboard component conditionals
  - [ ] `InstructorDashboardView.jsx` → rename to `TeacherDashboardView.jsx`

### 6. Frontend Folder Structure Alignment

- [ ] Create `lms-frontend/src/features/auth/`
- [ ] Create `lms-frontend/src/features/student/`
- [ ] Create `lms-frontend/src/features/teacher/`
- [ ] Create `lms-frontend/src/features/admin/`
- [ ] Create `lms-frontend/src/features/assessment/`
- [ ] Create `lms-frontend/src/features/courses/`
- [ ] Create `lms-frontend/src/features/ai/`
- [ ] Create `lms-frontend/src/features/analytics/`
- [ ] Create `lms-frontend/src/api/` — centralized API client
- [ ] Create `lms-frontend/src/utils/`
- [ ] Create `lms-frontend/src/constants/`
- [ ] Create `lms-frontend/src/types/`
- [ ] Create `lms-frontend/src/routes/`
- [ ] Create `lms-frontend/src/layouts/`

### 7. API Versioning

- [ ] Update `lms-backend/src/routes/index.js` — mount all routes under `/v1/`
- [ ] Update `lms-backend/src/app.js` — confirm `/api` base mount
- [ ] Update `lms-frontend/src/services/api.js` — set `baseURL` to `http://localhost:5000/api/v1`

### 8. Standardize API Response Format

- [ ] Create `lms-backend/src/helpers/apiResponse.js`:
  - [ ] `sendSuccess(res, data, message, statusCode)`
  - [ ] `sendError(res, message, errors, statusCode)`
- [ ] Update all existing controllers to use `apiResponse` helpers
- [ ] Verify all responses match `{ success, message, data }` format

### 9. Git Workflow Setup

- [ ] Verify `main` and `develop` branches exist
- [ ] Create `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Create root `.gitignore` (covers all services)
- [ ] Verify `*.env` files are gitignored

### Sprint 1A — Verification Checklist

- [ ] No `mongoose` dependency remains anywhere
- [ ] `lms-backend/src/models/` is empty or removed
- [ ] Supabase client initializes without error on backend start
- [ ] All role strings are `student`, `teacher`, `admin`
- [ ] API routes respond under `/api/v1/`
- [ ] All new directories created

---

## Sprint 1B — Foundation Verification

> **Goal:** Verify all three services start, connect, and are ready for feature development.
> **Layer:** Infrastructure / All
> **Sprint Status:** `[ ]`

### 1. Backend Health

- [ ] Backend starts without errors: `npm run dev` in `lms-backend/`
- [ ] `GET /api/v1/health` returns `{ success: true, status: "ok" }`
- [ ] Supabase connection verified (test query runs)
- [ ] Auth middleware loads without errors

### 2. Frontend Health

- [ ] Frontend starts without errors: `npm run dev` in `lms-frontend/`
- [ ] Landing page renders at `http://localhost:5173`
- [ ] No console errors on load
- [ ] API base URL correctly points to `http://localhost:5000/api/v1`

### 3. AI Platform Scaffold (Minimal FastAPI)

- [ ] `ai-platform/main.py` — FastAPI app with health endpoint
- [ ] `ai-platform/requirements.txt`
- [ ] `ai-platform/.env.example`
- [ ] `GET /health` returns `{ "status": "ok", "service": "ai-platform" }`
- [ ] AI Platform starts with `uvicorn main:app --reload`

### 4. Supabase Project Setup

- [ ] Supabase project created (or verified)
- [ ] `SUPABASE_URL` confirmed in backend `.env`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` confirmed in backend `.env`
- [ ] `SUPABASE_ANON_KEY` confirmed in frontend `.env`
- [ ] Supabase Auth enabled in project dashboard

### 5. Documentation

- [ ] Root `README.md` documents how to start each service
- [ ] `docs/02-Planning/Project_Decisions.md` created with Project Canon
- [ ] This checklist committed to repository

### Sprint 1 Complete Gate

- [ ] Sprint 1A verification passed ✅
- [ ] Sprint 1B verification passed ✅
- [ ] All three services start locally
- [ ] Supabase is connected and responding
- [ ] Git workflow is operational
- [ ] **Sprint 1 is COMPLETE — begin Sprint 2**

---

## Sprint 2 — Authentication & User Management

> **Goal:** Full authentication with Supabase Auth, JWT, RBAC, user profile management.
> **Layer:** Backend + Frontend
> **Sprint Status:** `[ ]`

### 2.1 Database Schema

- [ ] Design `users` table: `id (UUID → auth.users)`, `email`, `full_name`, `role`, `avatar_url`, `department`, `bio`, `is_active`, `created_at`, `updated_at`
- [ ] Create migration: `supabase/migrations/001_create_users.sql`
- [ ] Apply migration to Supabase
- [ ] Configure RLS policies for `users` table

### 2.2 Backend — Auth Service

- [ ] Install `@supabase/supabase-js` (if not done in 1A)
- [ ] Create `lms-backend/src/repositories/userRepository.js`
- [ ] Create `lms-backend/src/services/authService.js`
- [ ] Create `lms-backend/src/validators/authValidator.js`
- [ ] Rewrite `lms-backend/src/controllers/authController.js`:
  - [ ] `POST /api/v1/auth/register`
  - [ ] `POST /api/v1/auth/login`
  - [ ] `POST /api/v1/auth/logout`
  - [ ] `GET /api/v1/auth/profile`
  - [ ] `PUT /api/v1/auth/change-password`
- [ ] Update `lms-backend/src/middleware/authMiddleware.js` → verify Supabase JWT
- [ ] Update `lms-backend/src/middleware/roleMiddleware.js`

### 2.3 Backend — User Management

- [ ] Create `lms-backend/src/services/userService.js`
- [ ] Rewrite `lms-backend/src/controllers/userController.js`:
  - [ ] `GET /api/v1/users` (admin only)
  - [ ] `GET /api/v1/users/:id`
  - [ ] `PUT /api/v1/users/:id`
  - [ ] `DELETE /api/v1/users/:id` (admin, soft delete)
- [ ] Unit tests: `authService`, `userService`, `userRepository`
- [ ] Integration tests: all auth endpoints

### 2.4 Password Reset Flow

- [ ] `POST /api/v1/auth/forgot-password`
- [ ] `POST /api/v1/auth/reset-password`

### 2.5 Frontend — Auth

- [ ] Create `lms-frontend/src/api/client.js` — Axios with request/response interceptors
- [ ] Create `lms-frontend/src/api/authApi.js`
- [ ] Rewrite `lms-frontend/src/context/AuthContext.jsx` — Supabase session + role
- [ ] Update `lms-frontend/src/pages/Auth/Login.jsx`
- [ ] Update `lms-frontend/src/pages/Auth/Register.jsx`
- [ ] Create `lms-frontend/src/pages/Auth/ForgotPassword.jsx`
- [ ] Create `lms-frontend/src/pages/Auth/ResetPassword.jsx`
- [ ] Update `App.jsx` ProtectedRoute — new AuthContext + role-based redirect

### Sprint 2 — Verification

- [ ] Register creates user in Supabase Auth + `users` table
- [ ] Login returns valid JWT
- [ ] Protected routes redirect unauthenticated users
- [ ] Student → student dashboard, teacher → teacher dashboard, admin → admin dashboard
- [ ] Password reset email is sent and works
- [ ] All responses match `{ success, message, data }` format
- [ ] Unit tests passing
- [ ] Integration tests passing

---

## Sprint 3 — Course Management

> **Goal:** Full course CRUD, enrollment, learning materials.
> **Layer:** Backend + Frontend
> **Sprint Status:** `[ ]`

### 3.1 Database Schema

- [ ] `departments`: `id`, `name`, `description`, `created_at`
- [ ] `courses`: `id`, `title`, `description`, `teacher_id`, `department_id`, `status`, `thumbnail_url`, `created_at`, `updated_at`, `deleted_at`
- [ ] `course_enrollments`: `id`, `student_id`, `course_id`, `enrolled_at`, `status`
- [ ] `course_materials`: `id`, `course_id`, `title`, `type`, `url`, `order`, `created_at`
- [ ] Migrations + RLS for all tables
- [ ] Indexes on FK columns

### 3.2 Course API — Backend

- [ ] `courseRepository.js`, `courseService.js`, `courseValidator.js`
- [ ] Course controller: CRUD + publish + list enrolled students
- [ ] Enrollment controller: enroll, list my courses, unenroll
- [ ] Materials: upload (Supabase Storage), list, delete
- [ ] Unit + integration tests

### 3.3 Course UI — Frontend

- [ ] `lms-frontend/src/api/courseApi.js`
- [ ] `features/courses/` components: `CourseList`, `CourseCard`, `CourseDetail`, `CreateCourseModal`, `EnrollmentButton`, `CourseMaterials`
- [ ] Teacher: course management page
- [ ] Student: enrolled courses page
- [ ] Routes: `/courses`, `/courses/:id`, `/courses/create`

### Sprint 3 — Verification

- [ ] Teacher can create, edit, publish, archive course
- [ ] Student can browse and enroll
- [ ] Materials upload via Supabase Storage works
- [ ] RLS prevents students seeing unpublished courses
- [ ] All tests passing

---

## Sprint 4 — Assessment Module

> **Goal:** Assessment creation, question management, student attempt, submission, auto-grading.
> **Layer:** Backend + Frontend
> **Sprint Status:** `[ ]`

### 4.1 Database Schema

- [ ] `assessments`: id, course_id, teacher_id, title, type, duration, status, max_score, instructions, created_at
- [ ] `questions`: id, assessment_id, type (mcq/theory/coding), content, marks, order
- [ ] `question_options`: id, question_id, text, is_correct
- [ ] `assessment_submissions`: id, assessment_id, student_id, status, score, submitted_at, evaluated_at
- [ ] `submission_answers`: id, submission_id, question_id, answer_text, code_answer, selected_option_id, marks_awarded, feedback
- [ ] Migrations + RLS

### 4.2 Assessment API — Backend

- [ ] Repositories: `assessmentRepository.js`, `questionRepository.js`, `submissionRepository.js`
- [ ] Services: `assessmentService.js`, `evaluationService.js`
- [ ] Controllers: Assessment CRUD + publish, Question CRUD, Submission start/save/submit/evaluate
- [ ] Auto-grading for MCQ questions
- [ ] Unit + integration tests

### 4.3 Assessment UI — Frontend

- [ ] Teacher: Assessment builder (question editor, time limits, publish)
- [ ] Refactor `ActiveAssessment.jsx` → connect to new API
- [ ] Refactor `AssessmentLobby.jsx` → connect to new API
- [ ] Student: Result view with scores and feedback
- [ ] Teacher: Submission review and manual grading
- [ ] Routes updated

### Sprint 4 — Verification

- [ ] Teacher creates mixed assessment (MCQ + theory + coding)
- [ ] Student attempts, auto-saves, submits
- [ ] MCQ auto-graded correctly
- [ ] Timer enforces deadline
- [ ] Teacher can view all submissions and add manual grades
- [ ] All tests passing

---

## Sprint 5 — AI Platform Foundation

> **Goal:** Functional FastAPI service with AI Gateway, Prompt Manager, Model Manager, Tool Manager, Memory Manager.
> **Layer:** AI Platform
> **Sprint Status:** `[ ]`

- [ ] Full `ai-platform/` project structure (routers, services, agents, prompts, tools, memory, models, utils)
- [ ] `requirements.txt`: fastapi, uvicorn, python-dotenv, pydantic, httpx, langchain, groq, openai
- [ ] `GET /health` endpoint
- [ ] **AI Gateway** — entry point routing to correct agent
- [ ] **AI Router** — maps request type → agent
- [ ] **Prompt Manager** — load, version, render prompt templates from `prompts/templates/`
- [ ] **Model Manager** — Groq / Ollama multi-provider abstraction
- [ ] **Tool Manager** — register and execute function-calling tools
- [ ] **Memory Manager** — per-session conversation context
- [ ] `lms-backend/src/integrations/aiPlatform.js` — HTTP client for AI Platform
- [ ] `POST /api/v1/ai/chat` passthrough endpoint in Express
- [ ] Unit tests for gateway and prompt manager

### Sprint 5 — Verification

- [ ] AI Platform starts: `uvicorn main:app --reload`
- [ ] Prompt Manager renders a template correctly
- [ ] Model Manager calls Groq API and returns a response
- [ ] Express `/api/v1/ai/chat` proxies to AI Platform successfully

---

## Sprint 6 — RAG & ChromaDB

> **Goal:** Document ingestion pipeline, embeddings, semantic retrieval.
> **Layer:** AI Platform
> **Sprint Status:** `[ ]`

- [ ] Install ChromaDB, configure storage path
- [ ] `app/services/chromaService.py` — ChromaDB client wrapper
- [ ] Collections: `course_materials`, `assessment_questions`
- [ ] Document Ingestion Pipeline: PDF extraction → chunking → embedding → store in ChromaDB
- [ ] Retrieval Pipeline: query embedding → similarity search → top-N chunks → context assembly
- [ ] `POST /rag/ingest` and `POST /rag/query` endpoints
- [ ] Metadata: `course_id`, `document_title`, `chunk_index`, `source`
- [ ] Permission-aware retrieval (filter by `course_id`)
- [ ] Express: `POST /api/v1/ai/rag/ingest`
- [ ] Tests: ingestion, embedding, retrieval accuracy

### Sprint 6 — Verification

- [ ] PDF upload → chunks appear in ChromaDB
- [ ] Query returns semantically relevant chunks
- [ ] Results filtered by course correctly
- [ ] Context assembly feeds into Prompt Manager

---

## Sprint 7 — AI Features

> **Goal:** Tutor Agent, Question Generator, Evaluation Agent, Career Guidance, Coding Assistant.
> **Layer:** AI Platform + Backend + Frontend
> **Sprint Status:** `[ ]`

### 7.1 Tutor Agent

- [ ] `app/agents/tutorAgent.py` — context-aware Q&A using RAG
- [ ] `POST /agents/tutor` endpoint
- [ ] Frontend: `features/ai/AIChatWindow.jsx`
- [ ] Route: `/ai-tutor`

### 7.2 Question Generator Agent

- [ ] `app/agents/questionGeneratorAgent.py` — structured question output
- [ ] Backend passthrough: `POST /api/v1/ai/question-generator`
- [ ] Teacher: AI Question Generator button in assessment builder

### 7.3 Evaluation Agent

- [ ] `app/agents/evaluationAgent.py` — score + feedback + suggestions
- [ ] Auto-trigger on submission if `assessment.ai_evaluation = true`
- [ ] Backend passthrough: `POST /api/v1/ai/evaluate`

### 7.4 Career Guidance Agent

- [ ] `app/agents/careerAgent.py`
- [ ] Frontend: Career Guidance page for students

### 7.5 Coding Assistant Agent

- [ ] `app/agents/codingAssistantAgent.py` — hints, no solutions
- [ ] Hint button in coding question UI

### Sprint 7 — Verification

- [ ] Tutor answers with course context
- [ ] Question generator produces valid structured questions
- [ ] Evaluation returns score + feedback
- [ ] Career agent responds with personalized guidance
- [ ] All AI calls route through Express (never directly from frontend)

---

## Sprint 8 — Notifications & Dashboards

> **Goal:** Notification system, fully wired dashboards, analytics widgets.
> **Layer:** Backend + Frontend
> **Sprint Status:** `[ ]`

### 8.1 Notifications

- [ ] DB: `notifications` table + migration + RLS
- [ ] `notificationRepository.js`, `notificationService.js`
- [ ] `GET /api/v1/notifications`, `PATCH /:id/read`, `PATCH /read-all`
- [ ] Email notifications (Nodemailer): grade published, assessment due
- [ ] Frontend: notification bell in `Header.jsx` with unread count badge

### 8.2 Student Dashboard

- [ ] Wire `StudentDashboardView.jsx` to real API data
- [ ] Enrolled courses, upcoming assessments, recent grades, progress charts (recharts)

### 8.3 Teacher Dashboard

- [ ] Rename `InstructorDashboardView.jsx` → `TeacherDashboardView.jsx`
- [ ] Wire to real API: my courses, pending evaluations, student performance, recent submissions

### 8.4 Admin Dashboard

- [ ] Wire `AdminDashboardView.jsx` to real API: user counts, active courses, activity feed

### 8.5 Analytics API

- [ ] `GET /api/v1/analytics/student/:id`
- [ ] `GET /api/v1/analytics/course/:id`
- [ ] `GET /api/v1/analytics/institution`

### Sprint 8 — Verification

- [ ] Notifications appear and can be marked as read
- [ ] Grade published email is sent
- [ ] All three dashboards show real data
- [ ] Recharts render correctly
- [ ] Admin sees institution-wide stats

---

## Sprint 9 — Testing, Security & Optimization

> **Goal:** Comprehensive validation, security hardening, performance.
> **Layer:** All
> **Sprint Status:** `[ ]`

### Testing

- [ ] Full unit test coverage for all backend services
- [ ] Integration tests for all API endpoints
- [ ] Frontend component tests for critical UI
- [ ] AI Platform unit tests
- [ ] End-to-end: student register → enroll → assessment → result
- [ ] End-to-end: teacher create course → assessment → grade submission
- [ ] Load test: 100 concurrent users

### Security

- [ ] Rate limiting on auth endpoints
- [ ] Input sanitization audit
- [ ] RLS policy review and tightening
- [ ] JWT signing key strength review
- [ ] CORS configuration review
- [ ] No secrets in source code
- [ ] Prompt injection defenses in all agents
- [ ] Dependency audit: `npm audit`, `pip-audit`

### Performance

- [ ] Database indexes for slow queries
- [ ] Frontend lazy-loading routes
- [ ] Bundle size analysis
- [ ] Async job queue for AI evaluation tasks

### Accessibility

- [ ] Semantic HTML audit
- [ ] Keyboard navigation on all forms/modals
- [ ] Color contrast check
- [ ] ARIA labels on interactive elements

### Sprint 9 — Verification

- [ ] All automated tests pass
- [ ] No critical security vulnerabilities
- [ ] Load test passes (100 concurrent users)
- [ ] Lighthouse score > 80 on key pages
- [ ] No accessibility critical failures

---

## Sprint 10 — Deployment & Production Release

> **Goal:** Production environment, monitoring, documentation, launch.
> **Layer:** DevOps / All
> **Sprint Status:** `[ ]`

- [ ] `docker-compose.yml` production configuration complete
- [ ] Backend deployed (Railway / Render / VPS)
- [ ] Frontend deployed (Vercel / Netlify / VPS)
- [ ] AI Platform deployed
- [ ] Supabase in production mode
- [ ] Structured logging (Winston) in backend
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring configured
- [ ] SSL/HTTPS on all services
- [ ] Swagger/OpenAPI docs at `/api/v1/docs`
- [ ] FastAPI auto-docs at `/docs`
- [ ] Root README — full setup guide
- [ ] Deployment runbook created

### Production Release Gate

- [ ] All Sprint 1–9 verifications passed
- [ ] All critical bugs resolved
- [ ] Production monitoring active
- [ ] One student, one teacher, one admin verified in production
- [ ] **LMS-Assess v1.0 RELEASED** 🚀

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-17 | Supabase PostgreSQL — MongoDB removed | LMS is relational; avoid double-build |
| 2026-07-17 | Sprint 1 = alignment + verification | Existing code needs architectural alignment |
| 2026-07-17 | Role: `teacher` (not `instructor`) | Documentation standard; educational convention |
| 2026-07-17 | AI Platform in monorepo (`ai-platform/`) | Shared env, CI/CD, simpler local dev |
| 2026-07-17 | Tests alongside every sprint | No deferred testing; Sprint 9 = hardening only |

---

## Issue Tracker

| # | Sprint | Issue | Status | Resolution |
|---|--------|-------|--------|------------|
| 1 | 1B | MongoDB not installed locally | ✅ Resolved | Migrating to Supabase |

---

*Last updated: 2026-07-17 — Update this file at the end of every sprint and whenever tasks change status.*
