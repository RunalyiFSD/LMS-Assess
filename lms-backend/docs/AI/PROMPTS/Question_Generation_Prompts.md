---
Document: PROMPTS/Question_Generation_Prompts.md
Category: Project Root / Workspaces
Version: 1.0.0
Status: Published
---

# Prompt: Question Generation

## 1. Target LLM
Any (using standard ProviderFactory JSON mode)

## 2. Required Variables
- `{{topic}}`: The subject matter (e.g., 'React Hooks', 'Data Structures')
- `{{difficulty}}`: The difficulty level (e.g., 'beginner', 'intermediate', 'advanced')
- `{{count}}`: Number of questions to generate

## 3. The Prompt Text (MCQ)
```text
You are an expert educator.
Generate {{count}} multiple-choice question(s) on the topic of "{{topic}}" at a "{{difficulty}}" difficulty level.
Ensure there are 4 options and exactly one correct answer per question.
```

## 4. Expected Output Schema (MCQ)
```json
{
  "type": "object",
  "properties": {
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "questionText": { "type": "string" },
          "options": {
            "type": "array",
            "items": { "type": "string" }
          },
          "correctAnswerIndex": { "type": "number" },
          "explanation": { "type": "string" }
        },
        "required": ["questionText", "options", "correctAnswerIndex", "explanation"]
      }
    }
  },
  "required": ["questions"]
}
```

*(Similar schemas apply for coding and theory, adjusted for their respective expected outputs)*
