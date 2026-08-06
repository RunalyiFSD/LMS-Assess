# LMS-Assess Pre-Implementation Checklist

Every engineering sprint, major refactor, or AI enhancement must satisfy this pre-flight verification gate before any production code is modified.

---

## Pre-Flight Checklist

```text
[1. Repository Clean]
        ↓
[2. Engineering Brain Synced]
        ↓
[3. Current State Validated Against Code]
        ↓
[4. Git Branch Verified]
        ↓
[5. Dependencies Installed & Passing Tests]
        ↓
[6. Impact Report & Implementation Plan Approved]
        ↓
[7. Risk & Failure Taxonomy Reviewed]
        ↓
[8. Rollback Strategy Ready]
        ↓
[PROCEED TO IMPLEMENTATION]
```

---

## Detailed Gate Requirements

### 1. Repository Cleanliness & Environment
- [ ] Working tree is clean (`git status` shows no unstaged or conflicting modifications).
- [ ] Environment variables verified (`.env` contains valid `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `AI_PROVIDER`).
- [ ] No temporary debug scripts or sensitive tokens left in source directories.

### 2. Engineering Intelligence Alignment
- [ ] `CANONICAL_ENGINEERING_BRAIN.md` is at frozen v1.0.0 baseline.
- [ ] Active codebase verified against `MODULE_INDEX.md`, `API_INDEX.md`, and `DATABASE_INDEX.md`.
- [ ] Target branch verified (`Ai-developement` for AI platform, `dev` for core LMS).

### 3. Impact & Risk Assessment
- [ ] Sprint Impact Report generated with file-by-file modification plan.
- [ ] Service deprecation strategy in place (deprecate with `@deprecated` before deletion).
- [ ] Failure taxonomy categorized (Timeouts, 429s, JSON errors, Validation failures).
- [ ] Explicit Performance & SLO targets established (Latency < 4s, Success > 99%).

### 4. Rollback & Testing Readiness
- [ ] Rollback strategy defined (atomic semantic commits on feature/sprint branch).
- [ ] Test matrix includes AI Resilience cases (malformed JSON, 429 retries, markdown code block extraction).
- [ ] Formal design review and approval received.
