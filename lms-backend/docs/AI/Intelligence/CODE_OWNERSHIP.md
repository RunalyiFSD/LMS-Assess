# Code Ownership Matrix

This document defines engineering ownership, risk levels, and review responsibilities across all architectural domains of the LMS-Assess platform.

| Module | Primary Owner | Status | Reviewer | Risk Level | Notes / Boundaries |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | Abhijeet | Production Ready | Engineering Lead | High | JWT lifecycle, cookies, password hashing, role middleware (`authController.js`, `authMiddleware.js`). |
| **Assessment Engine** | Abhijeet | Production Ready | Senior Architect | High | Test scheduling, active assessment timers, auto-save (`assessmentController.js`, `attemptController.js`). |
| **Question Bank** | Abhijeet | Production Ready | Senior Architect | Medium | Question persistence, difficulty enums, tagging (`questionController.js`, question models). |
| **AI Question Generation** | Abhijeet | Completed / Hardening | AI Lead | High | LLM prompt compilation, provider execution, response normalization (`generationController.js`, `GroqProvider.js`). |
| **AI Evaluation Engine** | Abhijeet | Scaffolded (40-60%) | AI Lead | High | Automated rubric evaluation for Theory and Coding answers (`evaluationController.js`, `evaluationService.js`). |
| **Learning Analytics** | Abhijeet | Scaffolded (35%) | Engineering Lead | Medium | Performance metrics, weak topic detection (`analyticsController.js`, `analyticsService.js`). |
| **Messaging & Chat** | Abhijeet | Production Ready | Senior Engineer | Low | Direct student-instructor communication (`messageController.js`, `Message.js`). |
| **Notifications** | Abhijeet | Production Ready | Senior Engineer | Low | In-app alerts for assessments, grades, and system updates (`notificationController.js`). |
| **Admin System** | Abhijeet | Production Ready | Engineering Lead | Medium | User management, department/batch administration (`userController.js`, `departmentController.js`, `batchController.js`). |
| **Student Experience** | Abhijeet | Production Ready | Frontend Lead | Medium | Student dashboard, assessment lobby, test-taking UI (`StudentDashboardView.jsx`, `ActiveAssessment.jsx`). |
| **Instructor Experience** | Abhijeet | Production Ready | Frontend Lead | Medium | Assessment builder, AI generation interface, grading views (`InstructorDashboardView.jsx`, `QuestionGeneration.jsx`). |

---

## Escalation & Review Protocols

- **High-Risk Modules** (Auth, Assessment Engine, AI Platform): Require dual-pass architecture and security review before merging to `dev`.
- **Medium-Risk Modules** (Question Bank, Admin, Dashboards): Require standard PR review and passing integration test matrix.
- **Low-Risk Modules** (Notifications, Messaging): Require automated test pass and self-service PR review.
