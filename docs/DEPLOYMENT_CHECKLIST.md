# CodeCoach AI Deployment Checklist

## Build

- [x] `npm run build` passes.
- [x] `npm run build:server` passes.
- [x] `npm run lint` passes.
- [x] Vercel uses `dist` as the frontend output.
- [x] API functions are present in `api/`.

## Environment Variables

- [ ] Add `GEMINI_API_KEY` to Vercel Production, Preview, and Development environments.
- [ ] Add `GEMINI_MODEL` if overriding the default model.
- [x] `.env` and `.env.local` are ignored.
- [x] No Gemini key is present in the frontend bundle.
- [ ] Rotate any key that was exposed outside the secret manager.

## Tests

- [x] `npm test -- --coverage`: 12 tests passed.
- [x] Statements: 57.98%.
- [x] Lines: 62.79%.
- [x] Component/evaluator-related shared logic is covered; shared evaluator statements are 100%.
- [x] Tests mock Gemini and never make provider calls.

## Accessibility

- [x] Semantic banner, navigation, complementary sidebar, main content, labels, and live regions are present.
- [x] Editor and language controls have accessible labels.
- [x] Buttons have visible text or ARIA labels.
- [x] Local production preview has no horizontal overflow at desktop and 375px mobile widths.
- [x] Keyboard-focusable controls were inspected in the local production preview.
- [ ] Run axe/Lighthouse against the deployed URL and archive the report.

## Performance

- [x] Production bundle builds successfully.
- [x] Local production preview was smoke-tested at desktop and mobile widths.
- [x] Local production Lighthouse report captured at `docs/lighthouse-local.json`: Performance 85, Accessibility 95, Best Practices 100, SEO 82.
- [x] Local desktop/mobile screenshots captured during the production-preview audit.
- [ ] Run Lighthouse against the deployed URL; production scores must be recorded separately.
- [ ] Archive deployed desktop and mobile Lighthouse screenshots.
- [x] Production URL was checked on 2026-08-20, but Vercel redirected to its login page. Lighthouse therefore measured the login page, not CodeCoach: Performance 38, Accessibility 91, Best Practices 96, SEO 91. These scores are not application scores.
- [x] Public production alias `https://codecoach-54pzr10m3-harsharnaiks-projects.vercel.app/` audited: Performance 89, Accessibility 95, Best Practices 100, SEO 50.
- [x] Production `/api/health` returned `{ "status": "ok" }`.
- [x] Production Run Code interaction returned deterministic test results.
- [ ] Redeploy the current metadata changes, then rerun Lighthouse and axe. The current alias does not yet serve `/robots.txt`, confirming it predates the SEO metadata fix.

## Error Handling

- [x] Invalid request bodies return HTTP 400.
- [x] Unknown challenges return HTTP 404.
- [x] Gemini rate limits return HTTP 429 with a safe message.
- [x] Gemini keys, prompts, and stack traces are not returned to clients.
- [x] Malformed structured Gemini responses are rejected safely.
- [x] Deterministic `/api/run` does not call Gemini.

## Deployment

- [x] `api/health.ts`, `api/hint.ts`, `api/explain.ts`, and `api/run.ts` exist.
- [x] `vercel.json` has no invalid runtime declaration.
- [ ] Confirm `GET /api/health` on the deployed domain.
- [ ] Test Hint, Explain, Run, invalid input, and rate-limit behavior on the deployed domain.

## Rollback

1. Identify the last known-good deployment in Vercel.
2. Promote it to production.
3. Revert the source commit only after confirming the rollback is stable.
4. Recheck `/api/health`, Hint, Explain, and Run after rollback.

## Monitoring and Secrets

- Review Vercel function logs for `[ai:hint]` and `[ai:explain]` diagnostic categories.
- Never log API keys or complete user submissions.
- Monitor Gemini quota and rate-limit responses.
- Rotate compromised keys immediately.
