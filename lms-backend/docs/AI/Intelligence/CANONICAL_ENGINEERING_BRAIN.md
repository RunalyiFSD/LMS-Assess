# Canonical Engineering Brain

```yaml
Version: 1.0.0 (FROZEN)
Last Repository Scan: 2026-08-02 11:20
Git Commit: e65c6ab4e50194c91c0b767c120ffb3afd107cf6
Repository Branch: Ai-developement (targeting dev)
Repository State: Verified & Frozen
Verification Status: Complete
Last Auditor: Chief AI Architect
Approved By: Abhijeet
```

This document is the **Canonical Source of Truth** and the definitive Engineering Operating System for the LMS-Assess project. It supersedes all high-level documentation by mapping the exact, ground-truth relationships found in the source code.

> [!IMPORTANT]
> **DOCUMENTATION FREEZE v1.0**: The architectural baseline is frozen. From this point forward, no large speculative documentation will be created. The Engineering Brain will only be updated incrementally as features are completed.

---

## 1. Golden Implementation Lifecycle

Every future feature, bugfix, or refactor must strictly follow this verified engineering lifecycle:

```text
Understand Repository
        ↓
Read Engineering Brain
        ↓
Validate Current State (Compare docs with code)
        ↓
Complete Pre-Implementation Checklist
        ↓
Generate Implementation Plan / Impact Report
        ↓
Review Plan
        ↓
Update Brain
        ↓
Implement Code
        ↓
Run Tests (Unit, Integration, AI Resilience)
        ↓
Verify Feature
        ↓
Update Brain Again
        ↓
Generate Sprint Completion Report
        ↓
Commit (Semantic) → Pull Request → Merge to dev
```

*Rule: Never implement features that are not reflected in the Engineering Brain, and always validate documentation against live code before execution.*

---

## 2. Definition of "Done"

A feature or task is classified as **Done** only when all of the following ten criteria are satisfied:

1. **Backend Complete**: All models, controllers, services, and routes implemented and mounted.
2. **Frontend Complete**: Page view, subcomponents, real API integration, loading, error, and empty states rendered.
3. **Database Complete**: Schemas, validations, enums, and required compound indexes persisted.
4. **API Documented**: Endpoints, payloads, response shapes, and error codes documented in `API_INDEX.md`.
5. **Tests Completed**: Automated unit/integration tests and AI resilience matrix scenarios executed.
6. **Documentation Updated**: All relevant guides under `docs/AI/` synchronized with the implementation.
7. **Engineering Brain Updated**: `CANONICAL_ENGINEERING_BRAIN.md` and related registries updated.
8. **Technical Debt Reviewed**: Any new technical debt logged in `TECHNICAL_DEBT.md` or resolved.
9. **No Critical Bugs**: No runtime crashes, unhandled promise rejections, or data corruption.
10. **Ready for Merge**: Code reviewed, cleanly rebased, and ready for PR into `dev`.

---

## 3. Engineering Intelligence Index

### Architectural Memory & Mental Models
- [Project Knowledge Graph](./PROJECT_KNOWLEDGE_GRAPH.md) — The comprehensive visual map connecting the frontend, LMS backend, and AI Platform.
- [Feature Registry](./FEATURE_REGISTRY.md) — Deep flow maps (User -> Frontend -> Backend -> DB -> AI) for every feature.
- [Dependency Graph](./DEPENDENCY_GRAPH.md) — Interconnections, blockers, and dependencies between models and modules.
- [Engineering Decision Records (EDRs)](./ENGINEERING_DECISIONS.md) — The architectural "Why" (EDR-001 through EDR-008).

### Structure & API Indexes
- [Module Index](./MODULE_INDEX.md) — Deep breakdown of core domain modules (Assessment, Question Bank, AI Platform, Auth).
- [API Index](./API_INDEX.md) — Complete mapping of all controllers, mounted routes, and middleware.
- [Database Index](./DATABASE_INDEX.md) — Complete mapping of all Mongoose models, indexes, and relationships.

### Process & Governance
- [Sprint 3.2 Architecture Specification (v1.0.0)](./Sprint_3_2_Architecture_v1.0.md) — Frozen specification for decoupled AI Evaluation Engine & Orchestrator.
- [Pre-Implementation Checklist](./PRE_IMPLEMENTATION_CHECKLIST.md) — Standardized pre-flight gate for all new work.
- [Implementation Playbook](./IMPLEMENTATION_PLAYBOOK.md) — The developer's guide for adding new features, controllers, models, and providers.
- [Code Ownership Matrix](./CODE_OWNERSHIP.md) — Domain ownership, risk levels, and review responsibilities.
- [Testing Matrix](./TESTING_MATRIX.md) — Verification matrix for Unit, API, UI, and E2E validation.
- [Release Checklist](./RELEASE_CHECKLIST.md) — The mandatory 10-step gate for completing sprints and PRs.

### History & Implementation Truth
- [Branch History](./BRANCH_HISTORY.md) — The definitive record of Git branching, purpose, and environment evolution.
- [Sprint History](./SPRINT_HISTORY.md) — Past, current, and future sprint deliverables, lessons learned, and dependencies.
- [Implementation Status](./IMPLEMENTATION_STATUS.md) — Objective truth of what is production-ready vs scaffolded vs planned.
- [Technical Debt](./TECHNICAL_DEBT.md) — Verified log of duplicate services, bugs, and required refactors.
