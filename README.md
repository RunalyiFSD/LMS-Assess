# LMS-Assess

A unified, AI-powered Learning Management System (LMS) designed for comprehensive assessment and evaluation.

## Architecture

This repository is a monorepo containing three distinct services:

1. **`lms-frontend/`**: React/Vite SPA for students, teachers, and admins.
2. **`lms-backend/`**: Node.js/Express core API handling business logic and database orchestration.
3. **`ai-platform/`**: FastAPI microservice for heavy AI workloads (grading, generation).

## Quick Start (Local Development)

### 1. Database Setup
The project uses Supabase (PostgreSQL). You need a Supabase project and credentials.
Copy `.env.example` to a new `.env` file at the root, and also inside `lms-backend/` and `lms-frontend/`.
Fill in the `SUPABASE_URL` and keys.

### 2. Run Backend (Port 5000)
```bash
cd lms-backend
npm install
npm run dev
```

### 3. Run Frontend (Port 5173)
```bash
cd lms-frontend
npm install
npm run dev
```

### 4. Run AI Platform (Port 8000)
```bash
cd ai-platform
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```
