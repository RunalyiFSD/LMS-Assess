# LMS-Assess Testing Matrix

This matrix defines the required automated tests, manual verification steps, and expected outcomes for every major feature in the LMS-Assess platform.

---

## 1. Feature: AI Question Generator

| Test Level | Test Description | Verification Method | Expected Result |
| :--- | :--- | :--- | :--- |
| **Backend Unit** | `PromptRegistry` variable injection | Run unit script verifying `{{topic}}`, `{{count}}` replacements | String contains formatted variables |
| **Backend Unit** | `ProviderFactory` instantiation | Instantiate Groq, Gemini, Mock providers | Correct provider subclass returned |
| **API Integration** | `POST /api/v1/ai/generate/questions` | Authenticated request with topic, count, type | HTTP 200 with canonical JSON question array |
| **API Security** | Unauthorized request to `/generate/questions` | Request without JWT or with student role | HTTP 401 / HTTP 403 Forbidden |
| **Frontend UI** | Generation form submission & card rendering | Submit form in `QuestionGeneration.jsx` | Loading state activates, then cards render |
| **Database E2E** | Save generated questions to Question Bank | Click "Save to Question Bank" in UI | Questions persisted in MongoDB and listed in bank |
| **Assessment E2E** | Attach saved questions to Assessment | Build assessment and select saved question | Question attaches without enum mismatches |

---

## 2. Feature: Assessment & Student Attempt Flow

| Test Level | Test Description | Verification Method | Expected Result |
| :--- | :--- | :--- | :--- |
| **API Integration** | `POST /api/v1/assessments` | Create assessment with questions and duration | HTTP 201 Created with persisted `_id` |
| **API Integration** | `POST /api/v1/attempts/start` | Student initiates assessment session | HTTP 201 with new `Attempt` in `started` state |
| **UI E2E** | Assessment timer and navigation | Complete questions in `ActiveAssessment.jsx` | Timer counts down, question state updates |
| **API Integration** | `POST /api/v1/attempts/:id/submit` | Student submits answers | HTTP 200, status becomes `submitted`, `Result` created |
| **Grading E2E** | Deterministic MCQ scoring | Submit correct and incorrect MCQ choices | `totalMarks` calculated accurately in `Result` |

---

## 3. Feature: Authentication & RBAC

| Test Level | Test Description | Verification Method | Expected Result |
| :--- | :--- | :--- | :--- |
| **API Integration** | User Registration (`POST /api/v1/auth/register`) | Submit valid user details | HTTP 201, password hashed in DB, JWT returned |
| **API Integration** | User Login (`POST /api/v1/auth/login`) | Submit valid credentials | HTTP 200, JWT cookie/header set |
| **Middleware** | Role protection (`restrictTo`) | Student accesses `/api/v1/ai/generate/questions` | HTTP 403 Access Denied |
| **Rate Limiting** | Spamming auth endpoints | 15+ rapid requests to `/api/v1/auth/login` | HTTP 429 Too Many Requests |

---

## 4. Feature: AI Evaluation Engine (In Progress)

| Test Level | Test Description | Verification Method | Expected Result |
| :--- | :--- | :--- | :--- |
| **API Integration** | `POST /api/v1/ai/evaluate/theory` | Send answer and rubric | Structured feedback with score and explanation |
| **API Integration** | `POST /api/v1/ai/evaluate/coding` | Send code and test cases | Syntax analysis, logic rating, and score |
| **Database E2E** | Log evaluation event | Verify `AIEvaluationLog` creation | Audit log record created with provider details |
