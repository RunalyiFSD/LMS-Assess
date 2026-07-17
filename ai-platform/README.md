# LMS-Assess AI Platform

FastAPI microservice for AI features (Question Generation & Smart Grading).

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env` and fill in the required keys.

4. Run the server:
   ```bash
   python main.py
   # OR
   uvicorn main:app --reload --port 8000
   ```

The API will run at `http://localhost:8000`.
API documentation is available at `http://localhost:8000/docs`.
