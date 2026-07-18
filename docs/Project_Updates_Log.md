# LMS-Assess Project Updates & Technology Log

This log details the specific technologies adopted throughout the development of LMS-Assess, the rationale behind their selection, and how they are actively used in the project.

## 1. Frontend Technologies
| Technology | Used For | Rationale |
|------------|----------|-----------|
| **React 19 & Vite** | Core UI framework and build tool. | React provides a robust component ecosystem. Vite replaced Create-React-App for significantly faster Hot Module Replacement (HMR) and optimized production builds. |
| **Tailwind CSS** | Styling and responsive design. | Allows for rapid UI prototyping with utility classes. We strictly utilized Tailwind to achieve a "premium, modern aesthetic" without writing custom CSS files. |
| **Recharts** | Dashboard analytics and data visualization. | Used specifically in `StudentDashboardView` and `TeacherDashboardView` to render interactive Line and Bar charts for performance tracking. |
| **Lucide-React** | Iconography. | Clean, modern SVG icons used across the navbar, sidebars, and AI chat widgets. |
| **React Router v7** | Application routing. | Handles protected routes (`<ProtectedRoute>`), role-based redirection, and `lazy()` loading to split javascript bundles for performance. |

## 2. Backend Technologies
| Technology | Used For | Rationale |
|------------|----------|-----------|
| **Node.js & Express** | Core API server for business logic. | Lightweight, highly asynchronous framework perfect for handling high-volume student submissions and routing requests to the AI platform. |
| **Supabase (PostgreSQL)** | Primary database. | **Major Pivot:** We migrated away from MongoDB early in development. LMS data (Users -> Courses -> Assessments -> Attempts) is inherently relational. Supabase provides PostgreSQL with built-in Row Level Security. |
| **Bcrypt & JSONWebToken** | Authentication. | Securely hashes user passwords and issues stateless session tokens (JWT) stored in HTTP-only cookies. |
| **Winston & Morgan** | Observability and Logging. | `morgan` logs incoming HTTP requests, while `winston` formats and saves critical application events to rolling log files for production auditing. |
| **Helmet & Express-Rate-Limit** | Security hardening. | `helmet` secures HTTP headers against XSS/Clickjacking. Rate limiting prevents brute-force attacks on the auth endpoints. |
| **Swagger UI Express** | API Documentation. | Automatically generates interactive API specs at `/api/v1/docs` for frontend developers to reference. |

## 3. AI Platform Technologies
| Technology | Used For | Rationale |
|------------|----------|-----------|
| **Python 3.11 & FastAPI** | Dedicated AI Microservice. | Python is the industry standard for AI/ML. FastAPI provides an asynchronous, highly performant web server tailored for data-heavy operations. |
| **Groq API** | Large Language Model (LLM) Inference. | Selected over OpenAI for its LPU (Language Processing Unit) architecture, delivering ultra-fast token generation crucial for real-time AI tutoring and dynamic question generation. |
| **LangChain** | AI Orchestration. | Used to build the RAG (Retrieval-Augmented Generation) pipeline, manage memory buffers for the AI Chat, and chain prompts together. |
| **ChromaDB** | Vector Database. | Stores document embeddings locally. Used when a teacher uploads a syllabus PDF to search for context when generating questions. |
| **PyPDF2** | Document Ingestion. | Parses raw text from uploaded PDF files before they are chunked and embedded by LangChain. |

## 4. DevOps & Infrastructure
| Technology | Used For | Rationale |
|------------|----------|-----------|
| **Docker & Docker Compose** | Containerization. | Ensures the application runs identically on any developer's machine and in production. The entire stack spins up with a single command. |
| **Sentry (@sentry/node & react)** | Error Tracking. | Catches unhandled exceptions and performance bottlenecks in production, alerting developers instantly. |
| **Nginx** | Frontend Serving. | Used inside the frontend Docker container to serve the static React build blazingly fast. |

---
*Updated at the conclusion of Sprint 10.*
