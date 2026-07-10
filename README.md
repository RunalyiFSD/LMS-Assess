# AI-powered Coding Assessment Platform

This repository contains the source code for an AI-powered Coding Assessment Platform. It is structured as a monorepo consisting of a React frontend, Node.js backend, and a FastAPI AI service.

## Project Structure

- `frontend/`: React app using Vite (MERN stack frontend)
- `backend/`: Node.js + Express backend
- `ai-service/`: FastAPI (Python) service for AI features
- `docs/`: Architecture, API, Requirements, and Meeting Notes
- `database/`: Database scripts and migrations
- `docker/`: Docker-related files
- `scripts/`: Automation and CI/CD scripts
- `assets/`: Shared static assets

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Docker and Docker Compose (optional, for containerized execution)

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Set up environment variables: Copy `.env.example` to `.env`
4. Run development server: `npm run dev`

### Backend
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Set up environment variables: Copy `.env.example` to `.env`
4. Start the server: `npm run dev` or `node src/app.js`

### AI Service
1. Navigate to the ai-service directory: `cd ai-service`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables: Copy `.env.example` to `.env`
6. Run the server: `uvicorn app.main:app --reload`

### Docker Compose (Optional)
To run the entire stack via Docker:
```bash
docker-compose up --build
```
