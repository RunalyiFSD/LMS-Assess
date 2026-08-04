# Feature Registry

A detailed breakdown of every feature, its value, and the exact files involved across the stack.

## Feature: AI Question Generator

- **Business Goal**: Automate the creation of high-quality assessment items (MCQ, Coding, Theory) to save instructor time.
- **User Flow**: Instructor opens Dashboard -> Clicks AI Generation -> Configures difficulty/topic -> Reviews questions -> Saves to Question Bank.
- **Frontend Flow**: `QuestionGeneration.jsx` -> `aiService.js` (API) -> `SuccessState.jsx` / `ErrorState.jsx`
- **Backend Flow**: `aiRoutes.js` -> `generationController.js` -> `generationService.js`
- **AI Flow**: `generationService.js` -> `PromptRegistry.js` -> `ProviderFactory.js` -> `GroqProvider.js` -> Normalization -> Backend.
- **Database Flow**: Generated questions are ephemeral in memory until Instructor saves -> `questionController.js` -> `CodingQuestion.js` / `MCQQuestion.js`
- **Dependencies**: Provider API Keys, Prompt Files (`mcq.txt`, `coding.txt`).
- **Files**:
  - `src/pages/QuestionGeneration.jsx`
  - `src/services/aiService.js`
  - `src/ai/routes/aiRoutes.js`
  - `src/ai/controllers/generationController.js`
  - `src/ai/services/generationService.js`
  - `src/ai/providers/ProviderFactory.js`
- **Current Status**: Completed / Integration Stage.
- **Technical Debt**: Groq schema drops; duplicate generation service file.
- **Future Expansion**: Bulk generation, adaptive difficulty prediction.

## Feature: Student Assessment (Attempt)

- **Business Goal**: Provide a secure, timed environment for students to take assessments.
- **User Flow**: Student views assigned assessment -> Enters Lobby -> Starts Timer -> Submits Answers.
- **Frontend Flow**: `AssessmentLobby.jsx` -> `ActiveAssessment.jsx` -> `StudentAttempt.jsx` (hypothetical/implied component for viewing attempts).
- **Backend Flow**: `attemptRoutes.js` -> `attemptController.js`
- **Database Flow**: Reads `Assessment` -> Creates `Attempt` -> Updates `Attempt` (auto-save) -> Finalizes `Result`.
- **Dependencies**: Authentication, Question Bank data.
- **Current Status**: Production Ready.
