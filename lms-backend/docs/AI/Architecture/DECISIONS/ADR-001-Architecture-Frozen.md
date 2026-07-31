---
Document: ADR-001-Architecture-Frozen.md
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

# ADR 001: Freezing the AI Module Scaffolding

## 1. Status
**Accepted** (2026-07-25)

## 2. Context & Problem Statement
Integrating AI (specifically Large Language Models) into an existing platform like LMS-Assess introduces significant operational risk. LLM providers frequently change their APIs, models deprecate rapidly, and network latency is highly variable. 
If AI calls were directly integrated into the core LMS controllers (e.g., calling the Gemini SDK inside the standard `AssignmentController`), a failure in the LLM provider would bring down core LMS functionality. Furthermore, hardcoding prompts alongside business logic makes testing and version control exceptionally difficult. 
We needed an architectural design that mitigates these risks before any actual AI features are implemented.

## 3. Decision Drivers
- **Vendor Independence**: The system must seamlessly swap between Gemini, Groq, or future models without refactoring core logic.
- **Fault Tolerance**: The core LMS must survive an AI outage (graceful degradation).
- **Testability**: The deterministic backend logic must be independently testable from the non-deterministic LLM output.
- **Maintainability**: Prompts must be separated from source code.

## 4. Considered Options
- **Option 1: Direct SDK Integration (Rapid Prototyping)**
  - *Pros*: Fastest path to a working prototype.
  - *Cons*: Total vendor lock-in. Impossible to mock reliably. Mixes deterministic DB writes with non-deterministic LLM calls.
- **Option 2: Microservice Architecture**
  - *Pros*: Complete isolation. Infinite independent scaling.
  - *Cons*: Extreme operational overhead for Version 1. Over-engineered for our current user base.
- **Option 3: Highly Cohesive Monolithic Subsystem (Factory Pattern)**
  - *Pros*: Achieves logical isolation within the same Node.js process. Prevents vendor lock-in via abstract interfaces. Easy to mock in Jest.
  - *Cons*: Requires upfront boilerplate scaffolding before any features can be built.

## 5. Decision Outcome
**We chose Option 3: Highly Cohesive Monolithic Subsystem.**
The architectural scaffolding for the AI module (`Routes -> Controllers -> Services -> ProviderFactory -> Provider`) is now formally "frozen". 
No future Version 1 feature implementation is permitted to bypass this hierarchy. All AI interactions must flow through the isolated `src/ai/` directory and utilize the `ProviderFactory`.

## 6. Consequences
- **Positive**: We have achieved zero vendor lock-in. The system can switch LLM providers via a simple `.env` variable (`AI_PROVIDER`). The core LMS remains structurally oblivious to the AI logic, ensuring stability.
- **Negative**: Developers will experience friction. Implementing a simple AI feature now requires touching multiple layers (Route, Controller, Service, Prompt Registry) instead of writing a 10-line function. Adherence to `CODING_STANDARDS.md` is strictly required to enforce this separation of concerns.
