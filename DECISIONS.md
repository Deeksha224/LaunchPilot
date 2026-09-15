# Product Decisions

## 1. Problem

Product Operations teams need a simple way to understand which launches require attention and what actions should happen next.

## 2. Target User

Product Operations / Product teams managing multiple feature launches.

## 3. Product Scope

I focused on:
- launch tracking
- status visibility
- risk identification
- AI-assisted recommendations

I intentionally avoided broader workflow automation.

## 4. User Flow

Create/View Launch
→ Inspect Status and Notes
→ Identify Risk
→ Ask AI for Analysis
→ Review Recommendations
→ Product user decides what to do

## 5. Why AI?

Launch metadata is structured and deterministic, so traditional application logic handles CRUD and filtering.

Launch notes are unstructured. Gemini is useful for interpreting those notes and turning them into risk explanations and recommendations.

## 6. Why AI Does Not Automatically Change Status

AI recommendations can be incorrect. Launch status can have operational consequences, so the product keeps the final decision with the human user.

## 7. Storage

localStorage was chosen because this is a time-boxed prototype and persistent server-side storage was not necessary to demonstrate the core workflow.

## 8. What Was Intentionally Skipped

- Authentication
- Production database
- Slack/Jira integrations
- Automated notifications
- Role-based permissions
- Fully autonomous actions

## 9. Key Technical Decision

Gemini is accessed through the backend rather than directly from React so the API key remains server-side.

## 10. AI Reliability

Gemini responses use structured output and are validated before being returned to the frontend. Assumptions are surfaced rather than presented as facts.

## 11. Future Improvements

With more time:
- database persistence
- authentication and permissions
- launch dependency tracking
- historical risk trends
- Slack/Jira integrations
- approval workflow
- automated testing
- audit logs