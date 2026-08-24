# CodeCoach AI Deployment Checklist

## Build

* [x] `npm run build` passes.
* [x] `npm run build:server` passes.
* [x] `npm run lint` passes.
* [x] Vercel uses `dist` as the frontend output.
* [x] API functions are present in `api/`.

## Environment Variables

* [x] `GEMINI_API_KEY` is configured in the Vercel production environment.
* [x] `GEMINI_MODEL` is configured only when overriding the default model.
* [x] `.env` and `.env.local` are ignored.
* [x] No Gemini key is present in the frontend bundle.
* [x] API keys are kept in the deployment secret manager.

## Tests

* [x] `npm run test -- --coverage`: 13 tests passed.
* [x] Statements: 55.97%.
* [x] Branches: 55.35%.
* [x] Functions: 56%.
* [x] Lines: 54.2%.
* [x] Shared evaluator statements are 100% covered.
* [x] Tests mock Gemini and never make provider calls.

## Accessibility

* [x] Semantic banner, navigation, complementary sidebar, main content, labels, and live regions are present.
* [x] Editor and language controls have accessible labels.
* [x] Buttons have visible text or ARIA labels.
* [x] No horizontal overflow was observed at desktop and 375px mobile widths.
* [x] Keyboard-focusable controls were inspected.
* [x] Final deployed Lighthouse Accessibility score: 100.
* [x] Accessibility issues identified during development were addressed and rechecked against the production deployment.

## Performance

* [x] Production bundle builds successfully.
* [x] Production application was smoke-tested at desktop and mobile widths.
* [x] Final deployed Lighthouse audit was captured.
* [x] Performance: 96.
* [x] Accessibility: 100.
* [x] Best Practices: 100.
* [x] SEO: 100.
* [x] Production `/api/health` returned `{ "status": "ok" }`.
* [x] Production Run Code interaction returned deterministic test results.
* [x] Production Get Hint interaction was verified.
* [x] Production Explain Code interaction was verified.

## Error Handling

* [x] Invalid request bodies return HTTP 400.
* [x] Unknown challenges return HTTP 404.
* [x] Gemini rate limits return HTTP 429 with a safe message.
* [x] Gemini keys, prompts, and stack traces are not returned to clients.
* [x] Malformed structured Gemini responses are rejected safely.
* [x] Deterministic `/api/run` does not call Gemini.
* [x] Invalid user input was tested against the deployed application and produced a safe error state.

## Deployment

* [x] `api/health.ts`, `api/hint.ts`, `api/explain.ts`, and `api/run.ts` exist.
* [x] `vercel.json` has no invalid runtime declaration.
* [x] `GET /api/health` was confirmed on the deployed domain.
* [x] Hint was tested on the deployed domain.
* [x] Explain Code was tested on the deployed domain.
* [x] Run Code was tested on the deployed domain.
* [x] Invalid input handling was tested on the deployed domain.

## Rollback

If a production regression is discovered:

1. Identify the last known-good deployment in Vercel.
2. Promote the known-good deployment to production.
3. Revert the source commit only after confirming the rollback is stable.
4. Recheck `/api/health`, Hint, Explain, and Run after rollback.

## Monitoring and Secrets

* Review Vercel function logs for `[ai:hint]` and `[ai:explain]` diagnostic categories.
* Never log API keys or complete user submissions.
* Monitor Gemini quota and rate-limit responses.
* Rotate compromised keys immediately.

## Final Sign-off

* [x] Application is deployed and accessible.
* [x] Core user flows work in production.
* [x] Automated tests pass.
* [x] Coverage exceeds the 50% project requirement.
* [x] Lighthouse performance exceeds the 85 target.
* [x] Lighthouse accessibility score is 100.
* [x] Production error handling was verified.
* [x] Rollback procedure is documented.
* [x] No application secrets are committed to the repository.
