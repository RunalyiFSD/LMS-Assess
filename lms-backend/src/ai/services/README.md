# Services

## Purpose
Contains the core AI business logic interfaces and implementations for features like evaluation, generation, and tutoring.

## Responsibilities
- Orchestrate the generation of prompts using the Prompt Registry.
- Call the `ProviderFactory` to execute prompts against an LLM.
- Parse, validate, and structure the LLM output into predictable domain objects.
- Log usage metrics using the AI Logger.

## Future Extension Points
- Concrete implementations of `TheoryEvaluationService`, `TutorService`, etc.
- Multi-step reasoning chains or RAG orchestration.
