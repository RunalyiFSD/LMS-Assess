---
Document: GIT_WORKFLOW.md
Category: Workflow
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: Backend (AI Module)
Related Documents: 
  - ROADMAP.md
  - TESTING_GUIDE.md
Dependencies: None
Last Updated: 2026-07-25
---

# 1. Branching Strategy
The LMS-Assess AI module adheres to a strict feature-branch workflow to isolate experimental AI changes from the stable core platform.

- **`main`**: Represents production-ready, stable code. Direct commits are strictly forbidden.
- **`develop`**: The primary integration branch for the current major version (e.g., V1 AI-Ready).
- **`feature/`**: Dedicated branches strictly isolated per roadmap sprint. Naming must follow `feature/Sprint-XX-[Name]` (e.g., `feature/Sprint-03-QuestionGen`).
- **`hotfix/`**: Used for immediate production patches branched directly from `main`.

# 2. Commit Naming Conventions
All commits must follow the **Conventional Commits** standard to facilitate automated CHANGELOG generation and semantic versioning.

**Format**: `<type>(<scope>): <description>`

**Allowed Types**:
- `feat`: A new AI feature or pipeline.
- `fix`: A bug fix or prompt correction.
- `docs`: Documentation updates to the Project Brain.
- `test`: Adding or modifying tests.
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `chore`: Maintenance tasks (e.g., updating dependencies).

**Examples**:
- `feat(ai): add question generation service`
- `fix(eval): correct regex in prompt engine`
- `docs(brain): update API guidelines`

# 3. Pull Request (PR) Requirements
Before a `feature/` branch can be merged into `develop`, a Pull Request must be opened and meet the following mandatory gates:

- **Description**: The PR description must clearly outline the changes and link to the specific Sprint defined in `ROADMAP.md`.
- **Quality Gates**: The PR must pass 100% of the automated CI/CD checks defined in `TESTING_GUIDE.md` Chapter 13.
- **No Live AI Calls**: The CI run must complete without initiating any real LLM API calls.
- **Approval**: Requires at least one code review approval from a peer or lead architect.

# 4. Code Review Standards
Reviewers evaluating AI-specific features must specifically verify:
- **Abstraction**: `ProviderFactory` was correctly utilized; no direct imports of `Gemini` or `Groq` exist.
- **Security**: All prompts and inputs are properly sanitized against injection attacks.
- **Error Handling**: Network calls are wrapped in `try/catch` blocks and throw the custom errors defined in `CODING_STANDARDS.md`.

# 5. Merge Strategies
To maintain a clean and highly readable commit history on the integration branches:
- **Feature Branches**: Must be merged into `develop` using the **Squash and Merge** strategy. This collapses granular development commits into a single, cohesive Conventional Commit.
- **Rebasing**: Developers must rebase their feature branches against `develop` to resolve conflicts locally before merging.

# 6. Version Tagging & Release Management
Releases must be explicitly tagged in Git to align with the semantic versioning detailed in `ROADMAP.md`.
- Tags must follow the format `vMAJOR.MINOR.PATCH-STAGE`.
- Example: `v1.1.0-ai-sprint03`.
- Tags are applied to the `main` branch immediately after `develop` is merged into `main` for a production release.
