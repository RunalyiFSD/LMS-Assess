# Dependency Graph

Structured dependency trees for every feature.

## Assessment Builder
- **Required By**: Student Attempt, Results, Evaluation.
- **Uses**: Question Bank, Subjects, Departments, Batches, Users.
- **Blocks**: Students cannot take an assessment if this is broken.
- **Blocked By**: Question Bank (if questions are missing).
- **Future Features**: Adaptive pathing, AI Assessment Generation.

## Question Bank
- **Required By**: Assessment Builder, AI Evaluation.
- **Uses**: Subject, User (Creator).
- **Blocks**: Assessment creation.
- **Blocked By**: None.
- **Future Features**: Bulk import, Tagging.

## AI Question Generator
- **Required By**: Nothing (Enhancement feature).
- **Uses**: Prompt Registry, ProviderFactory, Subject definitions.
- **Blocks**: Nothing.
- **Blocked By**: API limits, Provider outages.
- **Future Features**: Batch generation.

## AI Evaluation Engine
- **Required By**: AI Analytics.
- **Uses**: Attempt, Result, Assessment, Prompt Registry, ProviderFactory.
- **Blocks**: Learning Recommendations.
- **Blocked By**: Student Attempt completion.
- **Future Features**: Career mapping.
