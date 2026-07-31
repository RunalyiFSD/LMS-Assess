---
Document: PROMPTS/README.md
Category: Project Root / Workspaces
Version: 1.0.0
Status: Published
---

# Prompt Engineering Workspace

**IMPORTANT DISTINCTION:** 
This directory (`docs/AI/PROMPTS/`) is for **documentation and iteration**. 
The actual `.txt` files executed by the backend application live in `src/ai/prompts/`.

Use this directory to design, discuss, and version-control prompt ideas, few-shot examples, and expected schemas before they are deployed to the `src/` directory.

## The Prompt Design Template

When drafting a new prompt or proposing changes to an existing one, create a markdown file here (e.g., `Question_Generation_V2.md`) using the following template:

```markdown
# Prompt: [Prompt Name]

## 1. Target LLM
[e.g., Gemini 1.5 Flash, Groq Llama 3]

## 2. Required Variables
List the mustache variables that the `PromptRegistry` must inject at runtime:
- `{{variable_1}}`: [Description]
- `{{variable_2}}`: [Description]

## 3. The Prompt Text
```text
[Insert raw prompt text here]
```

## 4. Expected Output Schema
```json
{
  "example_key": "string"
}
```

## 5. Iteration History & Results
- **v1**: [Notes on performance, hallucinations, etc.]
- **v2**: [What was changed to fix the issue]
```
