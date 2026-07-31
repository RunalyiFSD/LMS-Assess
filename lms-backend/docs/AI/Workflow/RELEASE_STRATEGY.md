---
Document: RELEASE_STRATEGY.md
Category: Workflow
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: Backend (AI Module)
Related Documents: 
  - GIT_WORKFLOW.md
  - ROADMAP.md
  - TESTING_GUIDE.md
Dependencies: None
Last Updated: 2026-07-26
---

# 1. Release Cadence
LMS-Assess does not release AI features in monolithic drops. Releases are iterative and strictly tied to the conclusion of the Sprints defined in `ROADMAP.md`. 
When a Sprint concludes and its corresponding `feature/` branch is merged into `develop`, a release candidate is prepared for deployment.

# 2. Environment Strategy

### Local Environment
- **Purpose**: Rapid development and initial prompt testing.
- **Provider**: Developers must use their personal API keys (e.g., `GEMINI_API_KEY`) or configure the `.env` to use the `MockProvider` to avoid local costs.

### Staging Environment (QA)
- **Purpose**: Integrated testing with frontend clients and QA validation.
- **Branch**: Deploys automatically from the `develop` branch.
- **Provider**: Uses a centralized, billing-capped API key. The `AI_PROVIDER` is set to the primary target model for the Sprint (e.g., `gemini-1.5-flash`).

### Production Environment
- **Purpose**: Live user traffic.
- **Branch**: Deploys strictly from tagged releases on the `main` branch.
- **Provider**: Uses production-grade API keys with established latency and failure alerts.

# 3. Environment Variable Management
The AI module relies on external configuration. Before a release is cut to Production, DevOps must verify the following variables exist in the live environment:

- `AI_PROVIDER`: Dictates which `ProviderFactory` subclass is instantiated (e.g., `gemini`, `groq`).
- `GEMINI_API_KEY`: (If provider is Gemini).
- `GROQ_API_KEY`: (If provider is Groq).
- `AI_LOGGING_ENABLED`: Boolean to toggle the Mongoose logging schema (defined in ADR-004).

*Note: Hardcoding keys into the repository is a fireable offense.*

# 4. The Release Checklist
Before `develop` can be merged into `main` and tagged for release, the following gates must be cleared:

1. **CI/CD Quality Gate**: 100% of the Jest tests (including Mock Provider suites) must pass in the GitHub Action runner (as defined in `TESTING_GUIDE.md`).
2. **Snapshot Stability**: Any updated `.txt` prompts must pass regression snapshot checks to ensure no unintended instruction drift.
3. **Feature Flagging**: If the AI pipeline is experimental, it must be hidden behind a boolean feature flag in the `User` or `Tenant` model until marketing/product teams authorize the rollout.

# 5. Rollback Procedures
Because AI APIs are inherently unstable outside of our network, we require a rapid rollback strategy:
- **Soft Rollback**: If Gemini goes down, DevOps can update the production `AI_PROVIDER` environment variable to `groq` to instantly route traffic to the fallback model.
- **Hard Rollback**: If a prompt update causes catastrophic failure, the `main` branch is reverted to the previous semantic tag (e.g., from `v1.1.0` back to `v1.0.9`) and redeployed instantly.
