# Sprint 02: Prompt Engine

## 1. Goal
Refine the `PromptRegistry.js` utility by implementing an in-memory caching mechanism to eliminate synchronous blocking disk I/O during production execution. Enhance variable injection robustness by throwing errors for unreplaced variables in strict environments to satisfy prompt validation requirements.

## 2. Git Branch
`feature/Sprint-02-PromptEngine`

## 3. Required Endpoints
- **Method**: N/A
- **Route**: N/A
- **Controller**: N/A
- **Service**: N/A

## 4. Required Prompts
- **Filename**: N/A
- **Variables**: N/A

## 5. QA / Test Criteria
- [ ] In-memory caching eliminates redundant file system reads.
- [ ] Unresolved variables (e.g. `{{missing_var}}`) throw a `PromptError` before reaching the LLM.

## 6. Status
Active
