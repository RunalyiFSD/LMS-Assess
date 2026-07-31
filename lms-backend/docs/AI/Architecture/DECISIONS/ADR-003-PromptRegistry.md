---
Document: ADR-003-PromptRegistry.md
Category: Architecture
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: Backend (AI Module)
Related Documents: 
  - ARCHITECTURE.md
  - CODING_STANDARDS.md
Dependencies: None
Last Updated: 2026-07-25
---

# ADR 003: Abstracting Prompts into a Centralized Registry

## 1. Status
**Accepted** (2026-07-25)

## 2. Context & Problem Statement
Prompts are the core deterministic drivers of non-deterministic LLM behavior. They are highly volatile, requiring frequent tuning and adjustment based on production edge-cases. 
If prompts are hardcoded as template strings inside standard JavaScript Service files (e.g., `EvaluationService.js`), any prompt adjustment requires modifying core business logic. This conflates behavioral logic changes with prompt engineering adjustments, muddying the Git history and severely complicating regression testing.

## 3. Decision Drivers
- **Separation of Concerns**: The need to isolate application execution logic (TypeScript/JavaScript) from prompt text.
- **Collaboration**: Non-engineers (e.g., instructional designers) may eventually need to review, tune, or audit prompt text without needing to navigate complex application logic.
- **Testability**: The requirement to perform snapshot testing on prompts independently of the LLM execution, as defined in `TESTING_GUIDE.md`.

## 4. Considered Options
- **Option 1: Inline Template Strings**
  - *Pros*: Easiest implementation. Allows direct use of JavaScript variables (`${variable}`).
  - *Cons*: Highly coupled. Clutters logic files with massive text blocks. Difficult to version-control or audit independently.
- **Option 2: MongoDB Prompt Database**
  - *Pros*: Prompts can be updated at runtime without a server deploy.
  - *Cons*: Breaks Git version control. Makes CI/CD testing extremely difficult for Version 1. Over-engineered for a system that isn't yet live.
- **Option 3: Flat `.txt` files loaded via a File-System Registry**
  - *Pros*: Retains full Git version control. Separates text from logic. Trivial to snapshot-test.
  - *Cons*: Requires a custom templating engine to inject runtime variables (e.g., replacing `{{student_answer}}` dynamically). Introduces minor disk I/O on load.

## 5. Decision Outcome
**We chose Option 3: Flat `.txt` files loaded via a File-System Registry.**
All prompts must be stored as raw `.txt` files within the isolated `src/ai/prompts/` directory. 
A dedicated `PromptRegistry` utility will be built to read these files from disk and securely inject variables at runtime. Inline string literals for prompts inside service files are explicitly banned.

## 6. Consequences
- **Positive**: Perfect separation of concerns. Prompts can be audited and snapshot-tested effortlessly. Git diffs on `.txt` files are highly readable, revealing exact prompt changes.
- **Negative**: We must build and maintain a custom variable injection system to safely replace mustache-style `{{variables}}` before passing the text to the `ProviderFactory`. A minor disk I/O penalty is introduced, which should be mitigated by caching the loaded `.txt` files in memory upon server start.
