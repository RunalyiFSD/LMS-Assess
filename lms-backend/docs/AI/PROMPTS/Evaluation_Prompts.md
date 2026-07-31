---
Document: PROMPTS/Evaluation_Prompts.md
Category: Project Root / Workspaces
Version: 1.0.0
Status: Published
---

# Prompt: AI Evaluation

## 1. Target LLM
Any (using standard ProviderFactory JSON mode)

## 2. Required Variables (Varies by Type)
**MCQ**:
- `{{question}}`
- `{{student_answer}}`
- `{{correct_answer}}`

**Coding**:
- `{{problem_statement}}`
- `{{student_code}}`

**Theory**:
- `{{question}}`
- `{{rubric}}`
- `{{student_answer}}`

## 3. Expected Output Schema (Universal)
All three evaluation endpoints should return the same root schema to make frontend parsing easier.
```json
{
  "type": "object",
  "properties": {
    "score": { "type": "number", "description": "Score out of 100" },
    "feedback": { "type": "string", "description": "Qualitative feedback for the student" },
    "isCorrect": { "type": "boolean" }
  },
  "required": ["score", "feedback", "isCorrect"]
}
```
