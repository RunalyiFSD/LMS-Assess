# LMS-Assess v1.0 🎓

Welcome to **LMS-Assess**, a next-generation Learning Management System supercharged with AI.

LMS-Assess breaks traditional assessment boundaries by dynamically generating course material and interactive quizzes from unstructured documents (PDFs) using Retrieval-Augmented Generation (RAG). It provides real-time performance analytics for students and automated evaluation pipelines for educators.

## 🚀 Key Features
- **AI Assessment Builder:** Upload a syllabus or document (PDF) and let Groq AI generate a comprehensive, structured test (MCQs, Theory, Coding).
- **Automated Grading:** Intelligent grading algorithms instantly evaluate student responses, providing actionable feedback.
- **RAG-Powered AI Tutor:** Context-aware chat assistants ready to help students understand their mistakes.
- **Live Dashboards:** Rich, interactive charts and statistics powered by `recharts`.
- **Role-based Access:** Dedicated workflows for Students, Teachers, and Admins.

## 🏗️ Architecture Stack
This repository is a monorepo consisting of three main microservices:

1. **`lms-frontend/`**
   - **Tech:** React 19, Vite, Tailwind CSS
   - **Role:** The user interface, Dashboards, Assessment Lobby, and AI Chat UI.
2. **`lms-backend/`**
   - **Tech:** Node.js, Express, Supabase (PostgreSQL)
   - **Role:** Core business logic, authentication (JWT), user management, and Supabase database interactions.
3. **`ai-platform/`**
   - **Tech:** Python, FastAPI, LangChain, Groq
   - **Role:** AI processing engine. Handles PDF ingestion, RAG vector embeddings (ChromaDB), and LLM prompting for quizzes and chat.

## 🛠️ Local Development Setup
To run the full stack locally for development:

1. Setup the Database: Ensure you have a Supabase project created. Run the SQL files found in `lms-backend/src/db/migrations/` in your Supabase SQL editor.
2. Provide Environment Variables: Copy the `.env.example` templates in both `lms-backend/` and `ai-platform/` to `.env` and fill in your Supabase and Groq keys.
3. Start the services (in separate terminals):
   ```bash
   # Terminal 1: Backend
   cd lms-backend
   npm install
   npm run dev

   # Terminal 2: AI Platform
   cd ai-platform
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   uvicorn main:app --reload

   # Terminal 3: Frontend
   cd lms-frontend
   npm install
   npm run dev
   ```

## 🌍 Production Deployment
LMS-Assess is fully containerized using Docker and is ready for production. 

Please refer to the detailed **[Deployment Runbook](./docs/Deployment_Runbook.md)** (or the provided artifact) for instructions on deploying to AWS, Vercel, Render, or Railway.

---
*Built with ❤️ for modern education.*
