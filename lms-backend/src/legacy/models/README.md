# legacy/models

These Mongoose models are **preserved during the Sprint 1A → Sprint 2 migration**.

## Status: LEGACY — DO NOT EXTEND

These files are the original MongoDB/Mongoose data models from the pre-Supabase architecture.

They will be **removed** once:
1. All corresponding Supabase PostgreSQL tables are created and verified (Sprint 2)
2. All controllers and services that referenced these models have been rewritten to use the Supabase repository layer
3. End-to-end testing confirms the Supabase implementation is correct

## When to remove this directory

After Sprint 2 is verified, run:
```bash
rm -rf lms-backend/src/legacy/
npm uninstall mongoose
```

## Models in this directory

| File | Supabase Table (Sprint 2) | Status |
|------|--------------------------|--------|
| User.js | `public.users` | Pending |
| Assessment.js | `public.assessments` | Pending |
| Attempt.js | `public.assessment_submissions` | Pending |
| CodingQuestion.js | `public.questions` (type=coding) | Pending |
| MCQQuestion.js | `public.questions` (type=mcq) | Pending |
| TheoryQuestion.js | `public.questions` (type=theory) | Pending |
| Leaderboard.js | `public.leaderboard` | Pending |
| Notification.js | `public.notifications` | Pending |
| Result.js | `public.submission_answers` | Pending |
| Subject.js | `public.subjects` | Pending |
