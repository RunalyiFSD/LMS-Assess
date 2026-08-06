---
Document: CHANGELOG.md
Category: Project Root
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: Backend (AI Module)
Related Documents: 
  - ROADMAP.md
  - GIT_WORKFLOW.md
Dependencies: None
Last Updated: 2026-07-26
---

# Changelog

All notable changes to the LMS-Assess AI Module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
*Developers: Log your active Sprint work here using `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security`. When the Sprint is released to production, this section will be renamed to the release version and date.*

## [1.0.0] - AI Readiness Scaffolding - 2026-07-26

### Added
- **Project Brain**: Established the official documentation structure covering Governance, Architecture, Engineering, and Workflow.
- **Provider Architecture**: Scaffolded the `ProviderFactory` and `BaseProvider` abstract classes to ensure vendor-independence (`ADR-001`, `ADR-002`).
- **Prompt Registry**: Created the `src/ai/prompts/` directory and registry logic to decouple LLM instructions from JavaScript source code (`ADR-003`).
- **Data Models**: Created Mongoose schemas for `AIEvaluationLog` and `AIUsageMetrics` to track token usage and latency without requiring a separate Vector DB (`ADR-004`).
- **Quality Gates**: Defined testing mandates requiring Jest provider mocks and strict schema validation for all future AI integrations.
- **Git Workflow**: Established the Branching and PR standards mapping to Semantic Versioning and Agile Sprints.
