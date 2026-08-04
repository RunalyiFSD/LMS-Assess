# Module Index

Deep dives into individual architectural modules.

## 1. Assessment Module
- **Controllers**: `assessmentController.js`, `attemptController.js`
- **Routes**: `assessmentRoutes.js`, `attemptRoutes.js`
- **Models**: `Assessment.js`, `Attempt.js`, `Result.js`
- **Frontend Components**: `AssessmentBuilder.jsx`, `ActiveAssessment.jsx`, `AssessmentLobby.jsx`
- **Frontend Pages**: `AdminAssessmentsPage.jsx`, `Dashboard.jsx`
- **Services**: `assessmentService.js` (implied by controllers, though core logic may reside in controllers directly in some patterns)
- **Dependencies**: Question Bank, Subjects, AI Evaluation
- **Production Status**: Production Ready (92%)

## 2. Question Bank Module
- **Controllers**: `questionController.js`
- **Routes**: `questionRoutes.js`
- **Models**: `CodingQuestion.js`, `MCQQuestion.js`, `TheoryQuestion.js`
- **Frontend Pages**: UI components embedded in Assessment creation.
- **Dependencies**: Core Models, Subject
- **Production Status**: Production Ready

## 3. AI Platform
- **Controllers**: `generationController.js`, `evaluationController.js`, `analyticsController.js`
- **Routes**: `aiRoutes.js`
- **Models**: `AIUsageMetrics.js`, `AIEvaluationLog.js`, `PromptTemplate.js`
- **Services**: `generationService.js`, `evaluationService.js`, `ProviderFactory.js`, `PromptRegistry.js`
- **Frontend Pages**: `QuestionGeneration.jsx`
- **Dependencies**: Question Bank (for save), Attempt (for evaluate).
- **Production Status**: Integration Phase (Generation: Done, Evaluation: 40%)

## 4. User & Authentication
- **Controllers**: `authController.js`, `userController.js`
- **Routes**: `authRoutes.js`, `userRoutes.js`
- **Models**: `User.js`
- **Frontend Pages**: `Login.jsx`, `Register.jsx`, `PublicProfile.jsx`
- **Dependencies**: None
- **Production Status**: Production Ready
