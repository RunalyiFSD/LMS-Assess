# LMS-Assess Master Project Documentation (v1.0)
*Status: Finalized & Production Ready*

## 1. Project Vision
LMS-Assess is a modern, AI-first Learning Management System designed to bridge the gap between traditional educational platforms and intelligent assistance. By automating assessment generation via RAG (Retrieval-Augmented Generation) and providing dynamic analytics, the platform significantly reduces educator workload while providing personalized feedback to students.

## 2. Core Architecture
The system employs a microservices-inspired monorepo architecture, ensuring high scalability and distinct separation of concerns.

### 2.1 Frontend (`lms-frontend`)
- **Framework:** React 19 + Vite.
- **Styling:** Tailwind CSS (Modern, premium aesthetics, dark mode ready).
- **Routing:** React Router v7 with dynamic `lazy()` loading and `<Suspense>` boundaries.
- **Data Visualization:** `recharts` for live analytics on teacher and student dashboards.
- **State Management:** React Context API (`AuthContext`) for session management.
- **Responsibility:** Handles all UI/UX, routing, and user interaction (Dashboards, Assessment Lobby, AI Chat Widget).

### 2.2 Backend API (`lms-backend`)
- **Framework:** Node.js (v20) + Express.js.
- **Database Connection:** Supabase (PostgreSQL). We explicitly migrated away from MongoDB to leverage relational integrity and Row Level Security (RLS).
- **Authentication:** Custom JWT-based authentication layered with bcrypt password hashing.
- **Observability:** Winston for structured logging, Morgan for HTTP request tracking, Sentry for error reporting.
- **Security:** Helmet for HTTP headers, `express-rate-limit` for brute-force protection, CORS configured for environment-specific domains.
- **Documentation:** Swagger UI available at `/api/v1/docs`.
- **Responsibility:** Core business logic, user management, handling assessment submissions, triggering notifications.

### 2.3 AI Engine (`ai-platform`)
- **Framework:** Python 3.11 + FastAPI (Uvicorn).
- **LLM Provider:** Groq (utilized for ultra-fast, low-latency inference).
- **RAG Stack:** LangChain, ChromaDB (Vector Store), PyPDF2 (Document parsing).
- **Responsibility:** Ingesting course materials (PDFs), generating dynamic assessments via RAG, powering the AI Tutor chat interactions.

## 3. Database Schema (Supabase / PostgreSQL)
The core entities revolve around:
- **Users:** `id`, `name`, `email`, `role` (student, teacher, admin).
- **Courses/Subjects:** Grouping mechanisms for content.
- **Assessments:** Meta-data for quizzes (`title`, `duration_minutes`, `is_active`).
- **Questions:** Granular items mapped to assessments (MCQ, Theory, Code).
- **Attempts & Submissions:** Student attempt tracking, state management (`in_progress`, `submitted`, `evaluated`).
- **Notifications:** In-app alert system polled by the frontend.

*Note: Critical performance indexes have been added to foreign keys (`student_id`, `assessment_id`) to optimize dashboard queries.*

## 4. Key Features & Workflows
- **Role-Based Access Control:** Strict protected routes. Students take exams; Teachers create courses/assessments; Admins oversee the institution.
- **AI Assessment Builder:** Teachers upload PDFs; the AI-platform parses the document into embeddings, storing them in ChromaDB. LangChain agents then extract context to generate relevant questions.
- **Live Dashboards:** `TeacherDashboardView` displays system-wide metrics (Active exams, pending reviews). `StudentDashboardView` charts historical performance.
- **In-App Notifications:** Real-time polling updates the top-nav bell icon when grades are published or assignments are created.

## 5. Deployment Orchestration
The entire suite is containerized via Docker.
- **Local Dev:** Individual `npm run dev` or `uvicorn` commands.
- **Production:** A master `docker-compose.yml` links the services, relying on environment variables (`GROQ_API_KEY`, `SUPABASE_URL`, `JWT_SECRET`).
- **Cloud Native:** Ready for Vercel (Frontend) and Render/Railway (Backend & AI).

---
*Document refined and optimized for LMS-Assess v1.0*
