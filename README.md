Create/update README.md for LaunchPilot.

Write a concise professional README suitable for an AI Product Builder assessment.

Include:

# LaunchPilot

## What it does
Explain that LaunchPilot is a lightweight Product Operations launch-readiness tracker that helps teams track launches and use Gemini to identify risks and recommend next steps.

## Core features
- Create launch
- Edit launch
- Delete launch
- Filter by status
- Risk visibility
- Gemini risk analysis
- AI recommended next steps
- AI-generated launch checklist
- localStorage persistence

## Tech stack
Use the actual technologies present in package.json.

## Architecture
Explain:

React frontend
→ Express backend
→ Gemini API
→ structured JSON
→ server validation
→ React UI

## Running locally

Include the exact commands actually required by the project.

Explain that the user must create .env with:

GEMINI_API_KEY=

Never include an actual API key.

## Assumptions

## Known limitations

Mention that:
- launch data uses localStorage for the prototype
- AI recommendations are advisory
- no external ticketing/Slack/Jira actions are executed
- authentication is not implemented
- AI output depends on model quality

## AI safety / reliability

Explain:
- API key stays server-side
- structured output is used
- responses are validated
- assumptions are surfaced
- AI does not automatically change launch status

Keep it factual and don't claim features that aren't implemented.