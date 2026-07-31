---
Document: SPRINTS/README.md
Category: Project Root / Workspaces
Version: 1.0.0
Status: Published
---

# Sprint Workspace

This directory is an active workspace. It houses the technical specifications for each sprint defined in `ROADMAP.md`. 
Before writing any code for a sprint, the lead developer or AI agent must create a sprint document here (e.g., `Sprint-01-QuestionGen.md`) and fill out the template below.

## The Sprint Template

When initiating a new Sprint, copy the following markdown block into a new file:

```markdown
# Sprint [XX]: [Sprint Name]

## 1. Goal
[Brief description of what this sprint accomplishes for the AI Module.]

## 2. Git Branch
`feature/Sprint-[XX]-[Name]`

## 3. Required Endpoints
- **Method**: [GET/POST]
- **Route**: `/api/ai/[endpoint]`
- **Controller**: `[controllerName]`
- **Service**: `[serviceName]`

## 4. Required Prompts
- **Filename**: `[prompt_name].txt`
- **Variables**: `{{var1}}`, `{{var2}}`

## 5. QA / Test Criteria
- [ ] Mocks created for `ProviderFactory`.
- [ ] Snapshot tests created for the prompt.
- [ ] Output validation schema defined.

## 6. Status
[Planned | Active | Completed]
```
