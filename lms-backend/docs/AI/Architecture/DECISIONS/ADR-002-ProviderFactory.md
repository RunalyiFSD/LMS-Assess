---
Document: ADR-002-ProviderFactory.md
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

# ADR 002: Enforcing the Provider Factory Pattern

## 1. Status
**Accepted** (2026-07-25)

## 2. Context & Problem Statement
The AI landscape is highly volatile. An application tied exclusively to a single LLM provider (e.g., OpenAI or Google Gemini) is vulnerable to model deprecations, API pricing changes, and regional outages. Furthermore, different providers have vastly different API signatures, making it difficult to switch models without a massive refactor of the underlying business logic. We needed a strategy to normalize diverse SDK responses into a single predictable format for the core system while maintaining the ability to hot-swap LLMs.

## 3. Decision Drivers
- **Hot-Swapping**: The requirement to change the active LLM provider via a simple environment variable (`AI_PROVIDER`) without altering application code.
- **Normalization**: The need to abstract away provider-specific response structures (e.g., Gemini's `candidates` array vs OpenAI's `choices` array).
- **Testability**: The need for easy dependency injection and mocking during automated testing (as defined in `TESTING_GUIDE.md`).

## 4. Considered Options
- **Option 1: Direct SDK Calls in Services**
  - *Pros*: Quickest to implement; gives developers full access to provider-specific features.
  - *Cons*: Total vendor lock-in. Switching models requires rewriting every service. Extremely difficult to mock in unit tests.
- **Option 2: Third-Party Middleware (e.g., LangChain)**
  - *Pros*: Out-of-the-box support for dozens of LLMs and advanced orchestration.
  - *Cons*: Extremely heavy dependency. Introduces its own form of lock-in (to the LangChain ecosystem). Overkill for the limited Version 1 scope (Question Generation & Evaluation).
- **Option 3: Custom BaseProvider Interface + ProviderFactory**
  - *Pros*: Lightweight, zero external dependencies. Enforces a strict contract (`BaseProvider`) while abstracting the instantiation logic (`ProviderFactory`). Makes mocking trivial.
  - *Cons*: Requires upfront development to normalize inputs/outputs. We lose access to provider-specific "magic" features unless explicitly added to the interface.

## 5. Decision Outcome
**We chose Option 3: Custom BaseProvider Interface + ProviderFactory.**
We have implemented a `BaseProvider` class that defines the exact contract (e.g., `async generateResponse(prompt)`). The `ProviderFactory.getProvider()` method dynamically returns the correct subclass (e.g., `GeminiProvider`, `GroqProvider`) at runtime based on the `.env` configuration. Direct instantiation of LLM SDKs within business logic is strictly prohibited.

## 6. Consequences
- **Positive**: We are entirely provider-agnostic. Mocking for unit tests is trivial (the factory can simply return a `MockProvider`). Adding a new LLM provider in the future (e.g., Anthropic) simply requires creating a new subclass that implements the `BaseProvider` contract.
- **Negative**: Normalizing responses from different SDKs requires continuous maintenance of the provider subclasses if the underlying APIs change.
