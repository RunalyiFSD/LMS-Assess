# LMS-Assess Setup Guide: From Zero to Running 🚀

This guide provides step-by-step instructions on how to start the LMS-Assess project from scratch on your local machine.

## Prerequisites
Before you begin, ensure you have the following installed on your system:
1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Python** (v3.10 or higher) - [Download here](https://www.python.org/downloads/)
3. **Git** - [Download here](https://git-scm.com/)
4. A **Supabase** account (Free tier is fine) - [Sign up here](https://supabase.com/)
5. A **Groq** API account for AI - [Sign up here](https://console.groq.com/)

---

## Step 1: Clone the Repository
Open your terminal (Command Prompt, PowerShell, or MacOS Terminal) and clone the project:
```bash
git clone https://github.com/your-username/LMS-Assess.git
cd "LMS-Assess"
```

---

## Step 2: Database Setup (Supabase)
LMS-Assess uses Supabase (PostgreSQL) for its database and authentication.
1. Create a new project in your Supabase dashboard.
2. Go to the **SQL Editor** in the Supabase sidebar.
3. Locate the migration file in the project folder: `lms-backend/src/db/migrations/004_create_notifications.sql` (and any other `.sql` files like `005_performance_indexes.sql`).
4. Copy the contents of those SQL files, paste them into the Supabase SQL Editor, and click **Run** to generate all the necessary tables.
5. Go to **Project Settings > API** in Supabase and copy your `Project URL` and `service_role` secret key. You will need these for the next steps.

---

## Step 3: Setup the Backend (Node.js)
Open a terminal and navigate to the backend folder:
```bash
cd lms-backend
```

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Configure Environment Variables:**
   - Copy the `.env.example` file and rename it to `.env`.
   - Open the `.env` file and fill in your Supabase credentials:
     ```env
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     JWT_SECRET=create_a_random_secure_password_here
     ```
3. **Start the Backend Server:**
   ```bash
   npm run dev
   ```
   *The backend is now running on `http://localhost:5000`.*

---

## Step 4: Setup the AI Platform (Python)
Open a **second, new terminal window** and navigate to the AI Platform folder:
```bash
cd ai-platform
```

1. **Create a Virtual Environment:**
   If you don't have a virtual environment setup, you must create one to isolate the Python dependencies.
   - **On Windows:**
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **On MacOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   *(You should now see `(venv)` at the start of your terminal prompt).*

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   - Copy the `.env.example` file and rename it to `.env`.
   - Open the `.env` file and fill in your Groq and Supabase credentials:
     ```env
     GROQ_API_KEY=gsk_your_groq_api_key_here
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

4. **Start the AI Server:**
   ```bash
   uvicorn main:app --reload
   ```
   *The AI Platform is now running on `http://localhost:8000`.*

---

## Step 5: Setup the Frontend (React)
Open a **third, new terminal window** and navigate to the frontend folder:
```bash
cd lms-frontend
```

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - You typically don't need a `.env` for local development since Vite proxies local requests automatically, but if you do, create a `.env` and add:
     ```env
     VITE_API_BASE_URL=http://localhost:5000/api/v1
     ```

3. **Start the Frontend Server:**
   ```bash
   npm run dev
   ```
   *The Frontend is now running on `http://localhost:5173`.*

---

## Step 6: Using the App
With all three terminals running simultaneously:
1. Open your browser and go to **`http://localhost:5173`**.
2. Click **Register** to create an Admin, Teacher, or Student account.
3. You are now fully set up and running locally!

*(To stop the servers, click inside the terminal window and press `Ctrl + C`)*
