# LMS-Assess AI Master Guide
**Version:** 1.0

---

# Part 1 — Project Foundation

## 1. Introduction
### Purpose
This document serves as the **authoritative governance document** for the AI implementation of the LMS-Assess project. 
Any conflict between documentation must be resolved in favor of the MASTER_GUIDE until officially amended.
It defines the project vision, development philosophy, implementation scope, architectural principles, engineering standards, sprint roadmap, and long-term direction for the AI module.

## 2. Project Overview
**Project Name:** LMS-Assess
**Project Type:** AI-Powered Learning Management System (LMS)
**Current Version:** AI Version 1 (V1)
**Architecture Status:** Frozen
**Development Phase:** Feature Implementation Phase

## 3. Current Project Status
| Item | Status |
|-------|--------|
| Frontend | Stable |
| Backend | Stable |
| Authentication | Complete |
| Assessment System | Complete |
| Question Management | Complete |
| Dashboard | Complete |
| Notifications | Complete |
| AI Architecture | Complete |
| AI Features | Not Started |

## 4. AI Vision
The objective of the AI module is **not** to replace the LMS. Instead, AI should enhance the existing workflows by providing intelligent assistance to both instructors and students. Every AI feature should feel like a natural extension of the platform rather than a separate application.

## 5. Version 1 Scope
Only the following features are included in Version 1.
- **AI Question Generator**: Coding, MCQ, Theory
- **AI Evaluation**: Coding, MCQ, Theory
- **AI Learning Assessment**: Performance Analysis, Topic Detection, Recommendations
- **AI Analytics**: Student, Instructor, Assessment

## 6. Out of Scope
The following features are intentionally excluded from Version 1: AI Tutor, Career Assistant, Resume Builder, Interview Coach, Learning Path Generator, RAG, Multi-Agent Systems, LangGraph, LangChain, FastAPI AI Microservices, Redis, Docker Scaling, Judge0.

## 7. Project Goals
1. Generate high-quality assessments.
2. Automatically evaluate answers.
3. Help instructors save time.
4. Improve learning outcomes through AI-driven insights.

## 8. Guiding Principles
- Simplicity over complexity.
- Feature-first development.
- Small incremental changes.
- Backward compatibility.
- Reusability.
- Maintainability.
- Scalability.
- Clear documentation.
- Security by default.
- Observable systems.

---

# Part 2 — Governance

## 1. Roles and Responsibilities
- **Architects**: Responsible for maintaining the frozen architecture, approving ADRs, and ensuring cross-module consistency.
- **Developers**: Responsible for strictly adhering to implementation guidelines and coding standards during sprint execution.
- **AI Agents**: Operate strictly within the bounds of this documentation, utilizing pre-approved prompts and adhering to the governance model.

## 2. Decision-Making & Change Management
The architecture is frozen. Any proposed change to the architecture requires an Architecture Decision Record (ADR) to be drafted, reviewed, and approved before any code is modified. 
All changes to business logic or API contracts must be documented before they are merged.

## 3. Approval Process
No feature is considered complete without passing:
1. Automated unit/integration tests (mocking the LLM provider).
2. A formalized Pull Request review.
3. Manual verification of LLM output quality.
4. Final documentation updates to the Changelog.

---

# Part 3 — Development Lifecycle

## 1. Sprint Lifecycle
Every sprint follows a fixed, predictable template:
`Objective` -> `Business Value` -> `Architecture Impact` -> `Implementation Tasks` -> `Acceptance Criteria` -> `Definition of Done`.
No sprint begins until the previous sprint is closed and documented.

## 2. Branching Strategy & Reviews
- **Feature Branches**: Branch from `Ai-developement`. Use format `feature/ai-<sprint-name>`.
- **Pull Requests**: All PRs must reference the active sprint document and pass the `Review-Prompt` AI checklist before human review.
- **Small Commits**: Commits must be small, logical, and represent a single complete thought or file change.

## 3. Testing Gates
Testing AI features is inherently non-deterministic. All core business logic and ProviderFactory wiring must be tested using deterministic mocks. Live LLM testing is reserved for staging environments and manual QA.

## 4. Definition of Done
A feature is Done when:
- The code is written and follows CODING_STANDARDS.
- Tests are passing.
- Implementation matches the Sprint document exactly.
- CHANGELOG.md is updated.
- The branch is merged into `Ai-developement`.

---

# Part 4 — AI Philosophy

## 1. Why AI is Being Added
AI is a tool to scale human capability, not to substitute human judgement. We use AI to automate the tedious aspects of education (grading boilerplate, generating base questions) so that instructors can focus on high-value human interaction.

## 2. Human Oversight
The system must never operate completely autonomously where stakes are high. Plagiarism checks, final grading, and broad analytics must always provide an avenue for instructor override. AI confidence scores or "Pending Review" flags must be surfaced to the UI.

## 3. Reliability, Maintainability, and Extensibility
- **Reliability**: Gracefully fallback if the provider fails. Log everything via `AILogger`.
- **Maintainability**: Prompts are stored in the `registry`, never hardcoded inline.
- **Extensibility**: The `ProviderFactory` ensures we can swap Gemini for OpenAI or Groq with a 1-line configuration change.

---

# Part 5 — Documentation Index

Our documentation is separated into four distinct domains to prevent mixing governance with implementation:

## 1. Governance
- **`MASTER_GUIDE.md`**: The constitution and final authority of the project.
- **`ROADMAP.md`**: Outlines the Vision, Milestones, Release Plan, and Sprint Mapping.
- **`CHANGELOG.md`**: The chronological record of completed sprints.

## 2. Architecture
- **`ARCHITECTURE.md`**: Details System Overview, Module Structure, Data Flow, Security, and Error Handling.
- **`DECISIONS/ (ADRs)`**: The historical record of *why* structural choices were made.

## 3. Engineering
- **`CODING_STANDARDS.md`**: How to write code (syntax, patterns, typing).
- **`IMPLEMENTATION_GUIDELINES.md`**: How to build features (commit size, PR rules, feature flags).
- **`TESTING_GUIDE.md`**: How to write deterministic tests for non-deterministic AI outputs.
- **`API_GUIDELINES.md`**: RESTful contracts and error shapes for frontend consumption.

## 4. Workflow
- **`GIT_WORKFLOW.md`**: Rules for branching and merging.
- **`RELEASE_STRATEGY.md`**: The pipeline from Sprint Complete -> QA -> Tag -> Release.
- **`SPRINTS/`**: Actionable templates and plans for upcoming features.
- **`PROMPTS/`**: Reusable AI context categorized into Development, Review, Documentation, and Testing.

---
