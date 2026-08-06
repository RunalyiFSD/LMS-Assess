---
Document: PROMPTS/Analytics_Prompts.md
Category: Project Root / Workspaces
Version: 1.0.0
Status: Published
---

# Prompt: AI Analytics

## 1. Target LLM
Any (using standard ProviderFactory JSON mode)

## 2. Required Variables & Schemas

### Weak Topics
- **Variables**: `{{evaluations_json}}`
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "weak_topics": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["weak_topics"]
}
```

### Recommendations
- **Variables**: `{{weak_topics_json}}`
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "recommendations": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["recommendations"]
}
```

### Student Metrics
- **Variables**: `{{student_data_json}}`
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "insights": { "type": "string" }
  },
  "required": ["insights"]
}
```

### Instructor Metrics
- **Variables**: `{{class_data_json}}`
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "insights": { "type": "string" }
  },
  "required": ["insights"]
}
```
