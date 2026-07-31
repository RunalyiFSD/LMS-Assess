---
Document: IMPLEMENTATION_GUIDELINES.md
Category: Engineering
Version: 1.0.0
Status: Published
Owner: Documentation Architect
Project: LMS-Assess
Applies To: Backend (AI Module)
Related Documents: 
  - ARCHITECTURE.md
  - CODING_STANDARDS.md
  - API_GUIDELINES.md
Dependencies: None
Last Updated: 2026-07-25
---

# 1. The AI Feature Lifecycle
When implementing a new AI feature for LMS-Assess, you must adhere to the frozen architecture. The data flow always follows this strict lifecycle:
`Route -> Controller -> Request Validation -> Service Layer -> Prompt Registry -> ProviderFactory -> LLM -> Response Validation -> Controller -> Client`

# 2. Step 1 - Adding a New Route & Controller
All AI-related routes must live in `src/routes/aiRoutes.js`. 
Controllers must live in `src/ai/controllers/`.

```javascript
// src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authController');
const { generateQuestions } = require('../ai/controllers/questionController');

router.post('/generate-questions', protect, restrictTo('instructor'), generateQuestions);
module.exports = router;
```

# 3. Step 2 - Building the Service Layer
Services encapsulate the core logic. They must instantiate the `ProviderFactory` and never import the SDK directly.

```javascript
// src/ai/services/QuestionService.js
const ProviderFactory = require('../providers/ProviderFactory');
const { AIProviderError } = require('../utils/AIErrors');

class QuestionService {
  async generate(topic, count) {
    try {
      const provider = ProviderFactory.getProvider();
      const rawPrompt = await PromptRegistry.get('question_generation.txt');
      const hydratedPrompt = PromptRegistry.inject(rawPrompt, { topic, count });
      
      const response = await provider.generateResponse(hydratedPrompt);
      return this.validateAndParse(response);
    } catch (error) {
      throw new AIProviderError('Failed to generate questions', error);
    }
  }
}
```

# 4. Step 3 - Creating and Registering Prompts
Never use inline template strings for prompts.
Create a new file in `src/ai/prompts/question_generation.txt`:
```text
You are an expert educator.
Generate {{count}} multiple-choice questions about {{topic}}.
Return ONLY a valid JSON array of objects with keys: "question", "options", "answer".
```

# 5. Step 4 - Parsing and Validating JSON Outputs
LLM outputs are strictly strings. You must safely parse and validate them against an expected schema (e.g., using Joi or Zod) before returning to the frontend.

```javascript
// Inside QuestionService.js
validateAndParse(rawString) {
  try {
    const json = JSON.parse(rawString);
    // TODO: Validate json against expected schema
    return json;
  } catch (error) {
    throw new AIProviderError('LLM returned invalid JSON schema');
  }
}
```

# 6. Step 5 - Logging Metrics
Always record token usage and latency.

```javascript
// Example Logging Integration
const AILogger = require('../utils/AILogger');

// After provider.generateResponse():
await AILogger.logUsage({
  feature: 'Question Generation',
  tokens: response.usage.totalTokens,
  latencyMs: response.latency,
  user: currentUser._id
});
```
