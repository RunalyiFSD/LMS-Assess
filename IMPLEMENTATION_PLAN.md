# Master Implementation Plan - AI Coding & Assessment Platform

This document consolidates the complete implementation plans across all core modules of the AI Coding & Assessment Platform, detailing architecture, backend APIs, database schemas, frontend components, and user workflows.

---

## Table of Contents
1. [Module 1: Authentication & Role-Based Access Control (RBAC)](#module-1-authentication--role-based-access-control-rbac)
2. [Module 2: Question Bank & Code Execution Engine](#module-2-question-bank--code-execution-engine)
3. [Module 3: Assessment & Test Evaluation Engine](#module-3-assessment--test-evaluation-engine)
4. [Module 4: Student Dashboard & Learning Analytics](#module-4-student-dashboard--learning-analytics)
5. [Module 5: Instructor Dashboard & Assessment Creation](#module-5-instructor-dashboard--assessment-creation)
6. [Module 6: Messaging & Real-Time Notification System](#module-6-messaging--real-time-notification-system)
7. [Module 7: Global Leaderboard & Standings System](#module-7-global-leaderboard--standings-system)
8. [Module 8: Admin Dashboard - Students & Instructors Management](#module-8-admin-dashboard---students--instructors-management)
9. [Module 9: Department Management Tab in Admin Dashboard](#module-9-department-management-tab-in-admin-dashboard)
10. [Module 10: Batches Management (`/admin/batches`)](#module-10-batches-management-adminbatches)
11. [Module 11: Tests & Assessments Administration (`/admin/assessments`)](#module-11-tests--assessments-administration-adminassessments)
12. [Module 12: Reports & Analytics Hub (`/admin/analytics`)](#module-12-reports--analytics-hub-adminanalytics)
13. [Module 13: System Settings (`/admin/settings`)](#module-13-system-settings-adminsettings)
14. [Module 14: Activity Audit Logs (`/admin/logs`)](#module-14-activity-audit-logs-adminlogs)
15. [Module 15: Support & Helpdesk Hub (`/admin/support`)](#module-15-support--helpdesk-hub-adminsupport)
16. [Module 16: Instructor Grade Submissions Suite (`/instructor/grade`)](#module-16-instructor-grade-submissions-suite-instructorgrade)
17. [Module 17: Question Bank Direct Assignment to Students (`/instructor/questions/assign`)](#module-17-question-bank-direct-assignment-to-students-instructorquestionsassign)

---

## Module 1: Authentication & Role-Based Access Control (RBAC)

### Objectives
Provide secure multi-tenant user authentication supporting local credential login, Google/GitHub OAuth integrations, JWT HTTP-Only cookies, and strict Role-Based Access Control (`student`, `instructor`, `admin`).

### Backend Architecture
- **Model**: `User.js` (`name`, `email`, `password`, `googleId`, `githubId`, `role`, `college`, `department`, `batch`, `profilePicture`).
- **Controller**: `authController.js` handling registration, login, logout, password resets, and OAuth callbacks.
- **Middleware**:
  - `protect`: Verifies JWT cookie/header and attaches user to request context.
  - `authorize(...roles)`: Enforces route access rules based on user role.

### Frontend Integration
- **Auth Context**: `AuthContext.jsx` for managing active user state, login modals, and session persistent storage.
- **Components**: Login / Signup modals, ProtectedRoute wrapper.

---

## Module 2: Question Bank & Code Execution Engine

### Objectives
Support three rich assessment question types (MCQ, Theory, and Coding) with an integrated remote sandbox execution engine for automated code evaluation.

### Backend Architecture
- **Models**:
  - `MCQQuestion.js` (Options, correct index, explanation, difficulty, subject).
  - `TheoryQuestion.js` (Prompt, sample answer, scoring criteria, max marks).
  - `CodingQuestion.js` (Problem statement, input/output test cases, hidden test cases, language constraints, template code).
- **Execution Service**: `codeExecutionService.js` connecting to Piston engine API to safely execute student code against test cases in isolated runtime environments (Python, JavaScript, C++, Java).

### Frontend Integration
- **Code Editor**: Monaco / CodeMirror editor with syntax highlighting, language selector, auto-indentation, and test case execution runner.
- **Question Creators**: Instructor forms for adding/editing MCQs, Theory questions, and test cases for Coding problems.

---

## Module 3: Assessment & Test Evaluation Engine

### Objectives
Enable creation of timed tests containing mixed question types, automated grading, submission locking, and result generation.

### Backend Architecture
- **Models**:
  - `Assessment.js` (Title, description, type, subject, duration, passing marks, total marks, scheduled start/end).
  - `Attempt.js` (Student reference, assessment reference, answers payload, time taken, status: `in-progress` | `submitted` | `graded`).
  - `Result.js` (Score obtained, percentage, status: `pass` | `fail`, breakdown by question).
- **Controllers**: `assessmentController.js` & `attemptController.js`.
  - Auto-grades MCQs and Coding test cases instantly on submit.
  - Generates final `Result` document upon grading completion.

### Frontend Integration
- **Test Taking Interface**: Timed assessment view with question navigation sidebar, auto-save timer, code sandbox, and final submit confirmation.
- **Result Summary View**: Detailed score breakdowns, correct answers overview, and code solution review.

---

## Module 4: Student Dashboard & Learning Analytics

### Objectives
Provide students with interactive performance visualizers, rank trackers, skill breakdown charts, and badging achievements.

### Backend Architecture
- **Analytics Controller**: `userController.getUserAnalytics` & `getUserProfile`.
  - Calculates global rank, total points, success rate, weekly score trends, and subject-wise accuracy vs class averages.

### Frontend Integration
- **Dashboard View**: `StudentDashboardView.jsx` & `ProgressAnalyticsView.jsx`.
  - Charts: Recharts area charts for weekly progress, radar/bar charts for skill distribution.
  - Achievement Badges: Top Performer, 7-Day Streak, Coding Expert, MCQ Master.

---

## Module 5: Instructor Dashboard & Assessment Creation

### Objectives
Empower instructors to create subjects, build tests, monitor live student attempts, grade manual theory questions, and view class distribution graphs.

### Backend Architecture
- **Controllers**: `subjectController.js`, `assessmentController.js`, `attemptController.js`.
  - Theory Manual Grading endpoint (`POST /api/attempts/:id/grade`).

### Frontend Integration
- **Dashboard View**: `InstructorDashboardView.jsx`.
  - Management tabs for Course Subjects, Assessments Creation, Question Bank, and Manual Grading Queue.

---

## Module 6: Messaging & Real-Time Notification System

### Objectives
Direct peer-to-instructor communication channels and automated system notifications for test assignments, results, and system announcements.

### Backend Architecture
- **Models**:
  - `Conversation.js` & `Message.js` (Sender, recipient, body, timestamp, unread flag).
  - `Notification.js` (User ref, title, message, link, read status).
- **Controllers**: `messageController.js`, `notificationController.js`, and `getUserDirectory`.

### Frontend Integration
- **Components**: Chat modal drawer, notification bell icon dropdown with real-time unread badges.

---

## Module 7: Global Leaderboard & Standings System

### Objectives
Gamified global and subject-specific rankings based on total points earned, speed, and accuracy.

### Backend Architecture
- **Model**: `Leaderboard.js` (Student ref, totalScore, testsCompleted, streakDays, rank).
- **Controller**: `leaderboardController.js` aggregating scores from verified `Result` documents.

### Frontend Integration
- **Leaderboard View**: Table displaying top performers with badges, medals, total points, and search filtering.

---

## Module 8: Admin Dashboard - Students & Instructors Management

### Objectives
Provide Administrators with complete CRUD lifecycle control, filtering, performance insights, and dedicated management interfaces for **Students** and **Instructors**.

### Backend Enhancements (`lms-backend`)
1. **`userController.js` Enhancements**:
   - `getAllUsers`: Query parameters `role` (`student`, `instructor`, `admin`), `search` (name or email regex), `department`, and `batch`.
   - `updateUserByAdmin`: `PUT /api/users/:id` endpoint allowing admins to edit user profile details (`name`, `email`, `role`, `college`, `department`, `batch`, `experience`, `language`) with optional password reset.
   - `getUserByIdAdmin`: `GET /api/users/:id` returning detailed user profile with aggregated test history / assessment creation metrics.
2. **`userRoutes.js` Updates**:
   - Register `GET /api/users/:id` and `PUT /api/users/:id` under `authorize('admin')` middleware.

### Frontend Enhancements (`lms-frontend`)
1. **Navigation Structure in `AdminDashboardView.jsx`**:
   - Dedicated tabs: **Students Management**, **Instructors Management**, **Course Subjects**, **Platform Analytics**.
2. **Students Management View**:
   - Metric summary cards: Total Students, Total Tests Attempted, Avg Pass Rate.
   - Search bar & dropdown filters (Department, Batch Year).
   - Student Table with columns: Avatar, Name, Email, Department, Batch, College, Tests Taken, Actions (`View Details`, `Edit Profile`, `Delete`).
3. **Instructors Management View**:
   - Metric summary cards: Total Instructors, Active Subjects, Total Assessments Created.
   - Search bar & Department filter dropdown.
   - Instructor Table with columns: Avatar, Name, Email, Department, Experience/Language, Role, Actions (`View Details`, `Edit Profile`, `Delete`).
4. **Modals & Drawers**:
   - **Create / Edit User Modal**: Role pre-selection with dynamic input fields based on role.
   - **User Detail Modal**: Full performance breakdown and account details view.

---

## Module 9: Department Management Tab in Admin Dashboard

### Objectives
Establish central administration over academic departments, department codes, Head of Department (HOD) faculty assignments, and dynamic student/instructor counts.

### Backend Architecture (`lms-backend`)
1. **Model (`Department.js`)**:
   - `name`: String (required, unique, e.g. "Computer Science & Engineering")
   - `code`: String (required, unique, uppercase, e.g. "CSE")
   - `description`: String
   - `headOfDepartment`: Ref `User` (Instructor)
   - `createdBy`: Ref `User` (Admin)
2. **Controller & Routes (`departmentController.js` & `departmentRoutes.js`)**:
   - `GET /api/departments`: Returns department list populated with HOD info and aggregated student/instructor counts.
   - `POST /api/departments`: Create department.
   - `PUT /api/departments/:id`: Update department details or HOD assignment.
   - `DELETE /api/departments/:id`: Delete department record.

### Frontend Integration (`lms-frontend`)
1. **Admin Dashboard (`AdminDashboardView.jsx`)**:
   - Add **Departments** tab (`activeTab === 'departments'`).
   - Metric cards for Total Departments, Total HODs, Total Students across departments.
   - Table displaying Department Code, Name, HOD, Student Count, Instructor Count, and Action buttons.
   - **Add/Edit Department Modal**: Create and modify department information.

---

## Module 10: Batches Management (`/admin/batches`)

### Objectives
Provide centralized administration over student academic batches (e.g. Batch 2024, Batch 2025, Batch 2026), tracking graduation years, department linkage, batch advisors, and active student enrollment counts.

### Backend Architecture (`lms-backend`)
1. **Model (`Batch.js`)**:
   - `name`: String (required, unique, e.g. "Batch 2026")
   - `academicYear`: String (required, e.g. "2022 - 2026")
   - `department`: Ref `Department`
   - `advisor`: Ref `User` (Instructor)
   - `status`: Enum (`Active`, `Graduated`, `Upcoming`)
2. **Controller & Routes (`batchController.js` & `batchRoutes.js`)**:
   - `GET /api/batches`: Returns all batches with populated department, advisor, and aggregated student count.
   - `POST /api/batches`: Create a new batch.
   - `PUT /api/batches/:id`: Update batch details, advisor, or status.
   - `DELETE /api/batches/:id`: Remove batch record.

### Frontend Integration (`lms-frontend`)
1. **Page Component (`BatchesPage.jsx`)**:
   - Route `/admin/batches` wrapped in `<Layout>`.
   - KPI Summary Cards: Total Batches, Active Batches, Total Enrolled Students.
   - Search & Filter bar by Department & Status.
   - Batches Roster Table: Batch Name, Department, Academic Year, Advisor, Student Count, Status Badge, Actions (`Edit`, `Delete`).
   - Add / Edit Batch Modal.

---

## Module 11: Tests & Assessments Administration (`/admin/assessments`)

### Objectives
Empower administrators to monitor, manage, and toggle status for all assessments created across all departments and instructors.

### Backend Architecture (`lms-backend`)
1. **Controller Extensions (`assessmentController.js`)**:
   - `getAllAdminAssessments`: Retrieve all tests across subjects with aggregate student attempt counts, pass counts, and creator details.
   - `toggleAssessmentStatus`: Enable or disable test availability (`PUT /api/assessments/:id/toggle`).

### Frontend Integration (`lms-frontend`)
1. **Page Component (`AdminAssessmentsPage.jsx`)**:
   - Route `/admin/assessments` wrapped in `<Layout>`.
   - KPI Summary Cards: Total Tests Created, Active Assessments, MCQ vs Coding vs Theory distribution.
   - Search & Filter bar by Type (`MCQ`, `Coding`, `Theory`), Subject, and Active Status.
   - Assessments Table: Title, Subject, Type Badge, Duration, Passing Score, Creator, Active Toggle Switch, Actions (`View`, `Toggle Status`, `Delete`).

---

## Module 12: Reports & Analytics Hub (`/admin/analytics`)

### Objectives
Deliver institution-wide learning analytics, departmental score comparison benchmarks, pass/fail trends, and exportable summary reports.

### Backend Architecture (`lms-backend`)
1. **Analytics Endpoints (`userController.js` / `publicController.js`)**:
   - `getInstitutionAnalytics`: Aggregate platform pass rates, average scores per department, score distribution histograms, and monthly test attempt volume.

### Frontend Integration (`lms-frontend`)
1. **Page Component (`ReportsAnalyticsPage.jsx`)**:
   - Route `/admin/analytics` wrapped in `<Layout>`.
   - KPI Summary Cards: Platform Overall Pass Rate, Average Test Score, Total Attempt Volume, Active Test-Takers.
   - Recharts Visualizers: Pass Rate by Department, Monthly Attempt Volume, Skill Distribution.
   - One-Click CSV/PDF Analytics Report Exporter.

---

## Module 13: System Settings (`/admin/settings`)

### Objectives
Centralized platform configuration for institution metadata, default assessment pass marks, security policies, and theme defaults.

### Frontend Integration (`lms-frontend`)
1. **Page Component (`AdminSettingsPage.jsx`)**:
   - Route `/admin/settings` wrapped in `<Layout>`.
   - General Settings: Institution Name, Support Email, System Timezone.
   - Assessment Policy: Default passing score %, max attempt retries, timer grace periods.
   - Security Settings: Session timeouts, password strength rules.

---

## Module 14: Activity Audit Logs (`/admin/logs`)

### Objectives
Maintain a secure, timestamped audit trail of all critical system actions (logins, user creations, profile updates, assessment submissions, security events).

### Backend Architecture (`lms-backend`)
1. **Model (`AuditLog.js`)**:
   - `user`: Ref `User`
   - `action`: String (e.g. `LOGIN`, `CREATE_USER`, `SUBMIT_ASSESSMENT`, `DELETE_DEPARTMENT`)
   - `details`: String
   - `ipAddress`: String
   - `severity`: Enum (`Info`, `Warning`, `Critical`)
   - `timestamp`: Date
2. **Controller & Routes (`auditController.js` & `auditRoutes.js`)**:
   - `GET /api/logs`: Retrieve filtered log entries by severity, date range, or user keyword.

### Frontend Integration (`lms-frontend`)
1. **Page Component (`ActivityLogsPage.jsx`)**:
   - Route `/admin/logs` wrapped in `<Layout>`.
   - Filter bar by Severity (`Info`, `Warning`, `Critical`) and Search Keyword.
   - Audit Trail Table: Timestamp, User, Action, Details, Severity Badge, IP Address.

---

## Module 15: Support & Helpdesk Hub (`/admin/support`)

### Objectives
Provide a ticketing support system for students and instructors to submit technical issues, score inquiries, or account access requests.

### Backend Architecture (`lms-backend`)
1. **Model (`SupportTicket.js`)**:
   - `ticketId`: String (unique)
   - `user`: Ref `User`
   - `subject`: String
   - `category`: Enum (`Technical Issue`, `Assessment Question`, `Account Access`, `General`)
   - `status`: Enum (`Open`, `In-Progress`, `Resolved`, `Closed`)
   - `priority`: Enum (`Low`, `Medium`, `High`, `Urgent`)
   - `messages`: Array of `{ sender, body, timestamp }`
2. **Controller & Routes (`supportController.js` & `supportRoutes.js`)**:
   - Ticket creation, status updates, and message replies.

### Frontend Integration (`lms-frontend`)
1. **Page Component (`SupportPage.jsx`)**:
   - Route `/admin/support` wrapped in `<Layout>`.
   - KPI Summary Cards: Open Tickets, In-Progress, Resolved Today.
   - Support Tickets Table: Ticket ID, User, Category, Priority Badge, Status, Actions.
   - Interactive Ticket Resolution Drawer to reply to users and update ticket status.

---

## Verification & Testing Matrix

| Feature / Module | Verification Method | Target Outcome |
| :--- | :--- | :--- |
| **RBAC Authentication** | Token verification unit test | Non-authorized requests return `401`/`403` status |
| **Code Execution Engine** | Test case runner execution | Correct output returned within sandbox execution limit |
| **Assessment Submission** | End-to-end attempt submit test | MCQ & Coding scores calculated, `Result` generated |
| **Student Analytics** | Profile GET request validation | Score, rank, and weekly trend graphs correctly computed |
| **Admin User Search & Filter**| `GET /api/users?role=student&search=john` | Filtered list matching search term returned |
| **Admin Update User** | `PUT /api/users/:id` API call | User fields updated without resetting password unintentionally |
| **Admin User Deletion** | `DELETE /api/users/:id` API call | User record cleanly removed with UI refresh |
| **Grade Submissions Suite** | `POST /api/assessments/attempts/:id/grade` | Theory marks saved, total score recalculated, attempt marked as `graded` |

---



---



---


---


---


---

## Module 24: Dark Mode Theme & Preference Persistence

### Objectives
Implement a dark mode theme across the platform with a user-controlled toggle (Sun / Moon icon) and dual-layer persistence (LocalStorage + User Database Settings) so selected theme preferences are automatically restored on page refreshes and logins.

### Frontend Architecture (`lms-frontend`)
1. **Theme Context & Hook (`ThemeContext.jsx`)**:
   - Manages `'light'` vs `'dark'` theme state.
   - Applies `.dark` class to `document.documentElement` (`<html>`).
   - Persists state in `localStorage.setItem('theme', theme)`.
   - Syncs user preference asynchronously to backend (`PUT /api/users/profile`, setting `user.settings.theme`).
2. **Header Integration (`Header.jsx`)**:
   - Renders Sun / Moon toggle button in top right navigation toolbar.
3. **App Wrapper (`App.jsx`)**:
   - Wrapped route hierarchy in `<ThemeProvider>`.









