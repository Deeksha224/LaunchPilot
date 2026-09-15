Create AI_USAGE.md documenting how AI was used during development.

Mention that:

## Tools Used

### ChatGPT
Used for:
- understanding the assignment
- comparing assignment options
- product scope decisions
- architecture decisions
- designing prompts
- debugging strategy
- reviewing trade-offs

### GitHub Copilot
Used for:
- generating React components
- implementing CRUD functionality
- localStorage logic
- Express routes
- Gemini integration scaffolding
- UI implementation
- error/loading states

## Important Manual Work

I reviewed and modified generated code rather than blindly accepting it.

Manual decisions included:
- selecting Option 4
- defining the product scope
- deciding what AI should and should not control
- keeping API keys server-side
- validating structured AI output
- testing CRUD and AI flows
- refining UI behavior
- deciding which features to omit because of the time constraint

## AI Limitations Observed

Document that generated code initially required debugging, including configuration/environment issues and Gemini model availability.

Do not invent additional AI failures.

## Verification

Mention:
- npm run lint
- npm run build
- backend syntax checks
- manual CRUD testing
- manual filtering testing
- manual AI testing using the supplied sample launches
- checking that AI output does not automatically modify launch status

Keep the document concise and truthful.