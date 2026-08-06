---
Document: ADR-004-MongoDB-First.md
Category: Architecture
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: Backend (AI Module)
Related Documents: 
  - ARCHITECTURE.md
  - ROADMAP.md
Dependencies: None
Last Updated: 2026-07-25
---

# ADR 004: MongoDB-First Storage Strategy

## 1. Status
**Accepted** (2026-07-25)

## 2. Context & Problem Statement
The AI module requires storing a significant volume of unstructured and semi-structured metadata: raw JSON outputs from the LLM, token usage and latency metrics, qualitative feedback arrays, and historical evaluation scores.
A common trend in modern AI architectures is the immediate introduction of a Vector Database (e.g., Pinecone, Milvus, Weaviate) to handle AI-related data. We had to decide whether to adopt a specialized AI database for these metrics or to extend our existing MongoDB data layer.

## 3. Decision Drivers
- **Infrastructure Simplicity**: The requirement to keep the DevOps and CI/CD footprint identical to the current platform.
- **Relational Access**: The absolute necessity to seamlessly join AI evaluation logs directly with existing `Student` and `Submission` schemas for rapid UI population.
- **Scope Restraint**: Version 1 explicitly excludes Retrieval-Augmented Generation (RAG) and semantic similarity search, which are the primary operational drivers for adopting a vector database.

## 4. Considered Options
- **Option 1: Dedicated Vector Database (e.g., Pinecone)**
  - *Pros*: Ready for future RAG integrations. Native similarity search.
  - *Cons*: High network latency. Introduces a completely separate infrastructure dependency. Over-engineered for simple log storage.
- **Option 2: Separate PostgreSQL Instance for AI Metrics**
  - *Pros*: Excellent for time-series analytics and strict schemas.
  - *Cons*: Breaks the Mongoose-only stack. Requires complex data synchronization to link AI data with the main MongoDB student records.
- **Option 3: Extend Existing MongoDB with AI Schemas**
  - *Pros*: Zero new infrastructure. Developers use the familiar Mongoose ORM. Seamless `$lookup` aggregations with core student data.
  - *Cons*: MongoDB is inefficient for vector similarity search if we ever attempt to use it for that purpose.

## 5. Decision Outcome
**We chose Option 3: Extend Existing MongoDB with AI Schemas.**
We will utilize Mongoose to define strict schemas (`AIEvaluationLog`, `AIUsageMetrics`, `StudentLearningPath`) and store them alongside the existing LMS models in `src/models/`. No external databases will be introduced in Version 1.

## 6. Consequences
- **Positive**: The operational footprint remains unchanged, reducing cost and deployment complexity. Developers face zero learning curve regarding database interactions.
- **Negative**: When RAG (Retrieval-Augmented Generation) is introduced in Version 2, MongoDB will likely be insufficient for high-performance semantic search. At that time, we will need to migrate or synchronize the `KnowledgeDocument` data into a true Vector Database, incurring future technical debt.
