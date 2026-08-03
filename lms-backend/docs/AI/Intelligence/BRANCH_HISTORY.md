# Branch History

This document serves as the definitive record of the repository's branch evolution, ensuring that all merges, their purposes, and ownership are explicitly tracked.

## Active Branches

### `dev`
- **Purpose**: Primary Integration Branch
- **Contains**: Consolidated frontend and backend features. Everything marked ready for QA before deployment.
- **Feeds / Merged Into**: `main`
- **Current Status**: Active Integration
- **Owner**: Abhijeet
- **Risk Level**: High (Integration gate)

### `Ai-developement`
- **Purpose**: Primary AI Feature Branch
- **Contains**: Prompt Registry, AI Providers, Generation features, Evaluation logic.
- **Merged Into**: `dev`
- **Current Status**: Active
- **Owner**: Abhijeet
- **Risk Level**: Medium

## Historical Branches

### `first_layer`
- **Purpose**: Experimental integration and baseline feature connection.
- **Contains**: Baseline AI integrations, Runalyi merge, Question Generator, Question Bank linking.
- **Merged Into**: `Ai-developement` → `dev`
- **Current Status**: Merged / Inactive
- **Owner**: Abhijeet

## Git & Repository Evolution
- **Repository Stabilization:** Resolved major merge conflicts, isolated experimental work.
- **Environment Cleanup:** Removed tracked `.env` files, sanitized `.gitignore`.
- **Branch Strategy Established:** Moving from feature branch → `Ai-developement` → `dev` → `main`.
