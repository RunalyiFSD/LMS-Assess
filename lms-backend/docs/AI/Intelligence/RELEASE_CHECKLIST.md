# LMS-Assess Sprint & Release Checklist

Every feature and sprint must pass this standardized release gate before merging into `dev` or tagging a release candidate.

---

## Sprint Release Gate

```text
[1. Feature Complete]
        ↓
[2. Documentation Updated]
        ↓
[3. Canonical Brain Updated]
        ↓
[4. Feature Registry Updated]
        ↓
[5. Dependencies Updated]
        ↓
[6. Technical Debt Logged / Cleared]
        ↓
[7. Automated & Manual Tests Passed]
        ↓
[8. PR Created with Semantic Commits]
        ↓
[9. Merged into dev]
        ↓
[10. Release Candidate Tagged]
```

---

## Detailed Checklist Items

### 1. Code & Feature Completeness
- [ ] Backend implementation complete (Models, Controllers, Services, Routes).
- [ ] Frontend implementation complete (UI, loading states, empty states, error handling).
- [ ] No hardcoded configuration, secrets, or unprotected API keys.
- [ ] Code follows `CODING_STANDARDS.md`.

### 2. Engineering Intelligence Synchronization
- [ ] `CANONICAL_ENGINEERING_BRAIN.md` metadata (commit, date, status) updated.
- [ ] `FEATURE_REGISTRY.md` reflects all new/modified files and user flows.
- [ ] `DEPENDENCY_GRAPH.md` reflects any new model or service dependencies.
- [ ] `IMPLEMENTATION_STATUS.md` percentages and maturity updated.
- [ ] `TECHNICAL_DEBT.md` updated with any newly identified technical debt or completed refactors.
- [ ] `SPRINT_HISTORY.md` records lessons learned and completed deliverables.

### 3. Verification & Quality Assurance
- [ ] Unit tests and route integration tests passing.
- [ ] Manual E2E test completed according to `TESTING_MATRIX.md`.
- [ ] Error scenarios (network failure, invalid inputs, unauthorized roles) verified.
- [ ] Response latency and rate limiting checked.

### 4. Git & Branch Hygiene
- [ ] Commits are atomic and use semantic prefixes (`feat:`, `fix:`, `docs:`, `refactor:`).
- [ ] No extraneous files or local test scripts committed.
- [ ] `.gitignore` intact and effective.
- [ ] Branch rebased cleanly onto latest `dev` before PR submission.
