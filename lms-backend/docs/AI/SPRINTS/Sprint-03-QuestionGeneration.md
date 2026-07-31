# Sprint 03: Question Generation

## 1. Goal
Deliver the ability to dynamically generate varied assessments (Coding, MCQ, and Theory questions) by creating the underlying `.txt` prompts, implementing the business logic in `generationService.js`, and exposing it via the `/api/v1/ai/generate/questions` endpoint using standardized JSend responses.

## 2. Git Branch
`feature/Sprint-03-QuestionGeneration`

## 3. Required Endpoints
- **Method**: POST
- **Route**: `/api/v1/ai/generate/questions`
- **Controller**: `generationController.generateQuestions`
- **Service**: `generationService.generateQuestions`

## 4. Required Prompts
- **Filename**: `question/mcq.txt`, `question/coding.txt`, `question/theory.txt`
- **Variables**: `{{topic}}`, `{{difficulty}}`, `{{count}}`

## 5. QA / Test Criteria
- [ ] ProviderFactory generates JSON payload successfully.
- [ ] Endpoint validates input and returns Standard JSend output.

## 6. Status
Active
