# Prompts Registry

## Purpose
Centralized storage and management of all LLM prompts used across the system. 
Prompts must NEVER be hardcoded as inline strings inside services or controllers.

## Responsibilities
- Provide a clean, versionable location for prompt templates.
- Organize prompts by domain (e.g., `evaluation/`, `question/`, `tutor/`).
- Allow prompt loading and variable interpolation at runtime.

## Future Extension Points
- Caching compiled prompts in memory.
- Loading prompts from a database for non-developer modifications.

## Subdirectories
- `question/`: Prompts for generating MCQ or coding questions.
- `evaluation/`: Prompts for grading theory or code.
- `career/`: Prompts for analyzing student profiles for career suggestions.
- `learning/`: Prompts for generating personalized learning paths.
- `tutor/`: Prompts for conversational AI tutoring.
