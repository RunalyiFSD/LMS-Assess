# LMS-Assess AI Roadmap
**Version:** 1.0

---

## 1. Vision Summary
The primary objective of the AI module in Version 1 is to establish a stable, production-ready foundation that intelligently assists instructors without superseding human judgement. This roadmap prioritizes creating a resilient architecture that supports dynamic question generation, automated evaluation, and actionable learning analytics.

---

## 2. Major Milestones
The Version 1 scope is divided into four major, incremental milestones. Each milestone delivers a complete, testable slice of functionality.

### Milestone 1: Foundation (Sprints 00 - 02)
- Architecture scaffolding and repository structure.
- Implementation of the `ProviderFactory` pattern to abstract LLM APIs.
- Development of the dynamic Prompt Engine to load, compile, and execute `.txt` based prompts.

### Milestone 2: Question Generation (Sprint 03)
- Delivering the ability to dynamically generate varied assessments.
- Support for Coding, Multiple Choice (MCQ), and Theoretical questions.

### Milestone 3: Evaluation Engine (Sprint 04)
- Automated grading logic for student submissions.
- Providing qualitative feedback, marks, and improvement suggestions for Coding, MCQ, and Theory answers.

### Milestone 4: Learning Analytics (Sprint 05)
- Translating evaluation data into actionable insights.
- Identifying weak topics and providing personalized learning recommendations.
- Aggregating metrics for student, instructor, and assessment dashboards.

---

## 3. Release Plan
All development follows a strict release gating strategy to ensure stability.

### Branching & Integration
- **Development**: Work occurs in isolated `feature/ai-<sprint-name>` branches.
- **Integration**: Code is reviewed and merged into the `Ai-developement` branch upon sprint completion.

### Version Tagging Strategy
Releases are tagged semantically upon the successful completion of milestones:
- `v1.0-ai-ready`: Architecture frozen (Current State).
- `v1.1-ai-core`: Provider Integration and Prompt Engine complete.
- `v1.2-ai-generation`: Question Generation complete.
- `v1.3-ai-evaluation`: Evaluation Engine complete.
- `v1.4-ai-analytics`: Learning Analytics complete (V1 Feature Complete).

---

## 4. Sprint Mapping
This roadmap translates directly into the following actionable sprints. They are strictly ordered; a sprint cannot commence until its predecessor is marked "Done".

| Sprint | Name | Status | Objective |
|--------|------|--------|-----------|
| **00** | AI Readiness | ✅ Complete | Scaffold architecture, define models, and freeze structure. |
| **01** | Provider Integration | ✅ Complete | Wire `ProviderFactory` to Gemini/Groq APIs. Ensure fault tolerance. |
| **02** | Prompt Engine | ✅ Complete | Build the pipeline to load `.txt` files, inject variables, and format payloads. |
| **03** | Question Generation | ✅ Complete | Implement business logic to generate Coding, MCQ, and Theory questions. |
| **04** | AI Evaluation | ✅ Complete | Implement business logic to evaluate answers and return structured feedback. |
| **05** | Learning Analytics | ✅ Complete | Aggregate AI evaluation data to detect weak topics and generate recommendations. |

---

*This document is governed by the `MASTER_GUIDE.md`. Any proposed changes to the milestones or sprint mapping must be reviewed against the V1 Scope.*
