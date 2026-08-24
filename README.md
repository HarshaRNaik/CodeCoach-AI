# CodeCoach AI

CodeCoach AI is a small coding-practice workspace designed to help learners improve their programming skills through guided practice rather than simply receiving solutions. It provides eight beginner-friendly coding challenges, six programming languages, a deterministic evaluator for supported challenges, and a server-side Gemini tutor that provides progressive hints and structured code explanations. The project focuses on meaningful AI assistance, safe API boundaries, accessible UI, testing, resilience, and production deployment.

## Features

* Eight beginner-friendly coding challenges.
* Six supported languages: JavaScript, TypeScript, Python, Java, C++, and Go.
* Language-specific starter code.
* In-browser code editor with local persistence.
* Deterministic challenge evaluation through `/api/run`.
* Progressive Gemini-powered hints.
* Structured Gemini-powered code explanations.
* Progress tracking and profile reset.
* Responsive interface for desktop and mobile.
* Loading states and safe API error handling.
* Server-side API key handling.

## Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Backend:** Express, TypeScript
* **Validation:** Zod
* **AI:** Google Gemini via the official `@google/genai` SDK
* **Testing:** Vitest, Supertest
* **Deployment:** Vercel
* **Storage:** Browser `localStorage`

## Getting Started

### Prerequisites

* Node.js 20+
* npm
* A Gemini API key for AI tutor features

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/HarshaRNaik/CodeCoach-AI.git
cd CodeCoach-AI
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

### Run locally

Start the Express API:

```bash
npm run server
```

In a second terminal, start the Vite development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

The Vite development server proxies `/api/*` requests to Express on port `3001`.

If the backend port is changed using `PORT`, update the corresponding proxy configuration in `vite.config.ts`.

## Architecture

CodeCoach AI separates the browser experience, API layer, AI service, validation, and deterministic evaluation.

```text
Browser
  │
  ├── React UI
  │     └── src/lib/api.ts
  │
  ▼
Express API
  │
  ├── Request validation ── Zod
  │
  ├── /api/run
  │     └── Deterministic evaluator
  │
  ├── /api/hint
  │     └── AI service ── Gemini
  │
  └── /api/explain
        └── AI service ── Gemini
```

### Frontend

The React frontend provides the coding workspace, challenge selection, language selection, editor, progress tracking, and tutor interactions.

Code is stored separately for each challenge and language using browser `localStorage`.

### API

The Express application validates requests, resolves challenge metadata, handles errors, and delegates AI operations to the Gemini service.

The same Express application is used locally and exposed through Vercel serverless functions in production.

### Deterministic evaluator

`/api/run` uses a controlled evaluator for the supported challenge set.

It does **not** execute arbitrary user code and does not send code to Gemini for execution. This keeps completion decisions predictable and avoids treating an LLM as a code-execution environment.

### Validation

Request bodies and structured Gemini responses are validated with Zod before data reaches the browser.

This provides a boundary between external model output and application state.

## AI Integration

Gemini is used as a coding tutor rather than as a generic chatbot.

The AI receives:

* The selected coding challenge.
* The selected programming language.
* The learner's current code.
* The requested hint level when generating hints.

### Progressive hints

Hints are intentionally divided into progressive levels so that the learner receives guidance without immediately being given a complete solution.

The prompt directs Gemini to provide conceptual, strategic, or implementation-oriented guidance depending on the selected level.

The goal is to help the learner identify the next step themselves.

### Code explanations

The Explain Code feature asks Gemini to return structured information containing:

* A summary of the code.
* Ordered explanation steps.
* Genuine issues identified in the code.
* A learning takeaway.

Gemini is configured for structured JSON output, and the returned data is validated with Zod before being returned to the frontend.

### Why AI is used

The AI component solves a specific learning problem: learners often know that their code is not working but do not know what to investigate next.

Instead of replacing the learner's code with an answer, CodeCoach AI uses Gemini to provide progressively more detailed guidance and explanations.

## API

### `GET /api/health`

Returns a health response without contacting Gemini.

```json
{
  "status": "ok"
}
```

### `POST /api/hint`

Accepts:

```json
{
  "challengeId": "challenge-id",
  "code": "learner code",
  "hintLevel": 1,
  "language": "javascript"
}
```

Returns:

```json
{
  "hint": "hint text",
  "level": 1
}
```

### `POST /api/explain`

Accepts:

```json
{
  "challengeId": "challenge-id",
  "code": "learner code",
  "language": "javascript"
}
```

Returns structured explanation data:

```json
{
  "summary": "summary",
  "steps": [],
  "issues": [],
  "learningTakeaway": "takeaway"
}
```

### `POST /api/run`

Accepts:

```json
{
  "challengeId": "challenge-id",
  "code": "learner code",
  "language": "javascript"
}
```

Returns deterministic evaluation results.

The evaluator does not contact Gemini.

## Resilience and Error Handling

The application treats AI responses and external provider failures as untrusted inputs.

* Invalid request bodies return HTTP `400`.
* Unknown challenges return HTTP `404`.
* Gemini rate limits return HTTP `429`.
* Tutor timeouts return HTTP `504`.
* Malformed structured Gemini responses are rejected safely.
* API keys are never returned to clients.
* Prompts and stack traces are not exposed to users.
* Requests are capped at 20 KB.
* Gemini calls have a 30-second timeout.
* The frontend receives normalized error messages rather than provider-specific internal details.
* The health endpoint works without contacting Gemini.
* The deterministic evaluator remains independent of Gemini.

If the Gemini provider is unavailable, users can still access the application and deterministic challenge functionality while tutor requests fail with a safe error state.

## Testing

The project uses Vitest and Supertest for backend API testing.

The final test run produced:

```text
Test Files: 1 passed
Tests:      13 passed (13)
```

### Coverage

```text
Statements: 55.97%
Branches:   55.35%
Functions:  56%
Lines:      54.2%
```

The final test suite covers:

* Health endpoint behavior.
* Successful hints.
* Repeated hint requests.
* Invalid hint requests.
* Unknown challenges.
* Structured code explanations.
* Malformed explanation output.
* Gemini failures.
* Gemini rate limits.
* Tutor timeouts.
* Deterministic evaluation.
* Invalid run requests.

Gemini calls are mocked during automated tests, so the test suite does not depend on provider availability or consume Gemini quota.

Run the test suite with:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test -- --coverage
```

## Verification Commands

### Backend type checking

```bash
npm run build:server
```

### Frontend production build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Tests

```bash
npm test
```

For a live tutor request, configure a valid `GEMINI_API_KEY`, start both processes, and use **Get Hint** or **Explain Code** from the UI.

## Performance and Accessibility

The final deployed application was audited with Lighthouse.

| Audit          |   Score |
| -------------- | ------: |
| Performance    |  **96** |
| Accessibility  | **100** |
| Best Practices | **100** |
| SEO            | **100** |

Accessibility improvements made during development included:

* Semantic page structure.
* Accessible labels for editor and language controls.
* Visible button labels and ARIA labels where appropriate.
* Live regions for dynamic status information.
* Keyboard-focusable controls.
* Responsive behavior at desktop and 375px mobile widths.
* Removal of horizontal overflow issues.

The final production application was smoke-tested after deployment, including the core Run, Hint, Explain, and invalid-input flows.

## Deployment

The production application is deployed on Vercel.

Vercel discovers the serverless API functions in `api/`. Each function uses the shared Express application from `server/app.ts`, allowing local development and production requests to use the same routes and validation logic.

Production environment variables are configured through Vercel rather than committed to the repository.

After deployment, the following production checks are performed:

```text
GET /api/health
Run Code
Get Hint
Explain Code
Invalid input handling
```

A deployment checklist containing build, testing, accessibility, performance, error-handling, secrets, monitoring, and rollback checks is available at:

`docs/DEPLOYMENT_CHECKLIST.md`

## Rollback Plan

If a production regression occurs:

1. Identify the last known-good Vercel deployment.
2. Promote the known-good deployment to production.
3. Revert the source commit if necessary after confirming the rollback is stable.
4. Recheck `/api/health`.
5. Recheck Run Code, Get Hint, Explain Code, and error handling.

Vercel deployment history provides the deployment-level rollback point, while Git provides the source-level rollback history.

## Known Limitations

* The evaluator is a controlled pattern-based evaluator for the supported challenge set and does not execute arbitrary code.
* Gemini availability and quota can affect tutor features.
* The application currently stores progress locally in the browser.
* There is no persistent account-based learning history.
* AI-generated guidance still requires validation because structured model output is not guaranteed to be correct.
* The current test suite focuses heavily on the API and deterministic evaluator rather than full React component-level testing.

## Future Improvements

* Add full React Testing Library component coverage.
* Add persistent learning history and attempt tracking.
* Add learning milestones and progress analytics.
* Add a provider health/status panel.
* Add retry backoff for temporary provider failures.
* Add CI automation that archives Lighthouse and accessibility reports.
* Expand the challenge and evaluator library.
* Add authenticated cloud synchronization.

## Project Links

**Live application:**
https://codecoach-ai-fawn.vercel.app/

**GitHub repository:**
https://github.com/HarshaRNaik/CodeCoach-AI

**Deployment checklist:**
`docs/DEPLOYMENT_CHECKLIST.md`

**Reflection:**
`docs/REFLECTION.md`

## Production Status

CodeCoach AI is deployed and functional.

The final production verification confirmed:

* **13/13 automated tests passing.**
* **55.97% statement coverage.**
* **55.35% branch coverage.**
* **56% function coverage.**
* **54.2% line coverage.**
* **Lighthouse Performance: 96.**
* **Lighthouse Accessibility: 100.**
* **Lighthouse Best Practices: 100.**
* **Lighthouse SEO: 100.**
* Production health endpoint working.
* Run Code working.
* Get Hint working.
* Explain Code working.
* Invalid input handled safely.
* Deployment and rollback procedures documented.
