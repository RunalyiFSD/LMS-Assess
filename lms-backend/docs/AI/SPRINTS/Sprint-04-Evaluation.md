# Sprint 04: AI Evaluation

## 1. Goal
Implement the core intelligence feature of the platform: automated grading. We will create the evaluation prompt templates, implement the `evaluationService` to grade student answers against defined rubrics, and expose three endpoints for Coding, MCQ, and Theory evaluations.

## 2. Git Branch
`feature/Sprint-04-Evaluation`

## 3. Required Endpoints
- **Method**: POST
- **Routes**: `/api/v1/ai/evaluate/coding`, `/api/v1/ai/evaluate/mcq`, `/api/v1/ai/evaluate/theory`
- **Controller**: `evaluationController`
- **Service**: `evaluationService`

## 4. Required Prompts
- **Filename**: `evaluation/mcq.txt`, `evaluation/coding.txt`, `evaluation/theory.txt`
- **Variables**: `{{question}}`, `{{student_answer}}`, `{{correct_answer}}`, `{{problem_statement}}`, `{{student_code}}`, `{{rubric}}`

## 5. QA / Test Criteria
- [ ] Prompts compile correctly.
- [ ] Service enforces strict JSON schemas for scoring.
- [ ] Endpoints validate inputs.

## 6. Status
Active
