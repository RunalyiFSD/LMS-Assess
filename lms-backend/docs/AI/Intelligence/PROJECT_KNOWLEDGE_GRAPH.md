# Project Knowledge Graph

A hierarchical visual map showing how the entire LMS-Assess system interacts.

```mermaid
flowchart TD
    %% Frontend Core
    subgraph Frontend [React / Vite Frontend]
        Dashboard[Dashboard] --> InstructorView[Instructor Dashboard]
        Dashboard --> StudentView[Student Dashboard]
        InstructorView --> AssessmentBuilder[Assessment Builder]
        StudentView --> ActiveAssessment[Active Assessment]
    end

    %% Features & Integration
    subgraph AI_Platform [AI Platform]
        QuestionGenUI[Question Generation UI] --> aiService[aiService.js]
        aiService --> AIRoutes[AI Routes API]
        
        AIRoutes --> GenerationController[Generation Controller]
        AIRoutes --> EvaluationController[Evaluation Controller]
        
        GenerationController --> GenerationService[Generation Service]
        EvaluationController --> EvaluationService[Evaluation Service]
        
        GenerationService --> PromptRegistry[Prompt Registry]
        GenerationService --> ProviderFactory[Provider Factory]
        
        ProviderFactory --> Groq[Groq Provider]
        ProviderFactory --> Gemini[Gemini Provider]
    end

    subgraph Backend_LMS [Backend LMS Core]
        AssessmentBuilder --> AssessmentRoutes[Assessment Routes]
        AssessmentRoutes --> AssessmentController[Assessment Controller]
        
        ActiveAssessment --> AttemptRoutes[Attempt Routes]
        AttemptRoutes --> AttemptController[Attempt Controller]
        
        AssessmentController --> AssessmentModel[(Assessment Model)]
        AttemptController --> AttemptModel[(Attempt Model)]
        AttemptController --> ResultModel[(Result Model)]
        
        AssessmentBuilder --> QuestionBank[Question Bank / Controller]
        QuestionBank --> QuestionModels[(Question Models)]
    end

    %% Cross-Links
    GenerationService --> QuestionBank
    AttemptModel -. Triggers .-> EvaluationController
    EvaluationService --> ResultModel
```

## System Interconnections

- **Assessment Builder** uses **Question Bank**.
- **Question Bank** receives generated data from **AI Generation**.
- **AI Generation** abstracts LLMs via **Provider Factory**.
- **Student Attempt** reads from **Assessment Builder**.
- **AI Evaluation** reads from **Student Attempt**.
