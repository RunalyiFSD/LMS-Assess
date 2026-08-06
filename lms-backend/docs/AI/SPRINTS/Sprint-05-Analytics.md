# Sprint 05: Learning Analytics

## 1. Goal
Translate raw evaluation data into actionable insights. We will implement endpoints that aggregate metrics, detect weak topics for students, and generate personalized learning recommendations. This sprint completes the V1 Feature Scope for the AI module.

## 2. Git Branch
`feature/Sprint-05-Analytics`

## 3. Required Endpoints
- **Method**: GET (using POST semantics for req.body in V1 tests, though API guidelines say GET) 
  *Note: HTTP GET with a request body is non-standard. We will adhere to `POST` for endpoints requiring JSON payloads in the controller, despite the `GET` label in API_GUIDELINES for analytics, to ensure standard HTTP compliance, or we will read from query params. Given the payloads are large JSON strings, `POST` is safer. For now, we will map them as `POST` to accept body payloads in our tests, but we will document this deviation.*
- **Routes**: `/api/v1/ai/assess/weak-topics`, `/api/v1/ai/assess/recommendations`, `/api/v1/ai/analytics/student`, `/api/v1/ai/analytics/instructor`
- **Controller**: `analyticsController`
- **Service**: `analyticsService`

## 4. Required Prompts
- **Filename**: `analytics/weak_topics.txt`, `analytics/recommendations.txt`, `analytics/student_metrics.txt`, `analytics/instructor_metrics.txt`

## 5. QA / Test Criteria
- [ ] Prompts compile correctly.
- [ ] Service enforces strict JSON schemas for insights.
- [ ] Endpoints validate inputs.

## 6. Status
Active
