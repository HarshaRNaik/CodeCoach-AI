# CodeCoach AI

CodeCoach AI is a small coding-practice workspace with eight challenges, a controlled deterministic evaluator, and a server-side Gemini tutor for progressive hints and code explanations. Learners can write in JavaScript, TypeScript, Python, Java, C++, or Go.

## Features

- Eight beginner-friendly coding challenges.
- Six selectable programming languages with language-specific starter code.
- In-browser editor with local persistence.
- Deterministic challenge evaluation through `/api/run`.
- Progressive Gemini hints and structured code explanations.
- Progress tracking, profile reset, responsive layout, loading states, and safe API errors.

## Tech stack

React, TypeScript, Vite, Express, Zod, the official `@google/genai` SDK, Vitest, Supertest, and Vercel serverless functions.

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`.
3. Start the API in one terminal: `npm run server`
4. Start Vite in another terminal: `npm run dev`
5. Open `http://localhost:5173`.

The Vite development server proxies `/api/*` to Express on port `3001`. Set `PORT` to change the backend port and update the proxy in `vite.config.ts` if needed.

## API

- `GET /api/health` returns `{ "status": "ok" }` without contacting Gemini.
- `POST /api/hint` accepts `{ challengeId, code, hintLevel, language }` and returns `{ hint, level }`.
- `POST /api/explain` accepts `{ challengeId, code, language }` and returns `{ summary, steps, issues, learningTakeaway }`.
- `POST /api/run` accepts `{ challengeId, code, language }` and returns deterministic `{ results }` without contacting Gemini.

The API validates request bodies and Gemini JSON responses with Zod. The Gemini key is read only by the Express process; `.env` and `.env.local` are ignored by Git. Requests are capped at 20 KB and Gemini calls time out after 30 seconds. The client receives normalized errors without stack traces or provider details.

## Architecture

The browser uses `src/lib/api.ts` for tutor requests. Express validates the request, resolves challenge metadata, and delegates Gemini work to `server/services/aiService.ts`. Gemini is instructed to respond with a schema-constrained JSON object, which is parsed and validated before it reaches the browser. Code execution remains separate in the frontend's controlled evaluator and is never sent to Gemini for execution.

Code is saved separately for each challenge and language in localStorage.

### AI prompt design

The Gemini service receives the challenge description, selected language, and current learner code. Hint prompts explicitly select a conceptual, strategic, or implementation-oriented level and prohibit immediately replacing the learner's work. Explanation prompts request a summary, ordered steps, genuine issues, and a learning takeaway. Gemini is configured for JSON output and every response is validated with Zod before it reaches the browser.

## Known limitations

- The evaluator is a controlled pattern-based evaluator for the supported challenge set; it does not execute arbitrary code.
- Gemini quota and provider availability can produce HTTP 429 or other safe API errors.
- Lighthouse and axe scores must be captured against the final deployed URL, not the local preview.

## Future improvements

- Add full component-level React Testing Library coverage.
- Add a hosted history of attempts and learning milestones.
- Add a provider status panel and retry backoff for quota pressure.
- Add a deployment CI job that archives accessibility and Lighthouse reports.

## Project links

- Live URL: configure and record the Vercel production URL after deployment.
- GitHub: https://github.com/HarshaRNaik/CodeCoach-AI

Local production audit: Lighthouse Performance 85, Accessibility 95, Best Practices 100, SEO 82. Public production audit for `https://codecoach-54pzr10m3-harsharnaiks-projects.vercel.app/`: Performance 89, Accessibility 95, Best Practices 100, SEO 50. The SEO score is lowered by the currently deployed build's missing meta description/crawlability metadata; those fixes are now in source and require redeployment.

See [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) for deployment, rollback, monitoring, secrets, accessibility, and performance checks. See [docs/REFLECTION.md](docs/REFLECTION.md) for the project reflection.

## Verification

- `npm test` runs mocked endpoint tests; it never calls Gemini.
- `npm run build:server` type-checks the backend.
- `npm run build` creates the frontend production bundle.
- `npm run lint` checks the workspace.

To verify a live tutor request, configure a valid `GEMINI_API_KEY`, start both processes, and use **Get hint** or **Explain code** in the UI. Without the key, health and validation still work, while tutor requests return a safe configuration error.

## Deployment notes

Vercel discovers the serverless functions in `api/`. Each function imports the shared Express app from `server/app.ts`, so local `npm run server` and production `/api/*` use the same routes and validation. In Vercel Project Settings, add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` for Production, Preview, and Development. Never commit `.env` files. Keep the deterministic evaluator unchanged unless its challenge tests are updated alongside it.

After deploying, verify `https://YOUR-DOMAIN.vercel.app/api/health` returns `{ "status": "ok" }`, then test Hint, Explain Code, and Run tests from the deployed UI. Redeploy with `vercel --prod` or by pushing to the connected Git branch.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
