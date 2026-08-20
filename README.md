# CodeCoach AI

CodeCoach AI is a small coding-practice workspace with eight challenges, a controlled deterministic evaluator, and a server-side Gemini tutor for progressive hints and code explanations. Learners can write in JavaScript, TypeScript, Python, Java, C++, or Go.

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

The API validates request bodies and Gemini JSON responses with Zod. The Gemini key is read only by the Express process; `.env` and `.env.local` are ignored by Git. Requests are capped at 20 KB and Gemini calls time out after 30 seconds. The client receives normalized errors without stack traces or provider details.

## Architecture

The browser uses `src/lib/api.ts` for tutor requests. Express validates the request, resolves challenge metadata, and delegates Gemini work to `server/services/aiService.ts`. Gemini is instructed to respond with a schema-constrained JSON object, which is parsed and validated before it reaches the browser. Code execution remains separate in the frontend's controlled evaluator and is never sent to Gemini for execution.

Code is saved separately for each challenge and language in localStorage.
## Verification

- `npm test` runs mocked endpoint tests; it never calls Gemini.
- `npm run build:server` type-checks the backend.
- `npm run build` creates the frontend production bundle.
- `npm run lint` checks the workspace.

To verify a live tutor request, configure a valid `GEMINI_API_KEY`, start both processes, and use **Get hint** or **Explain code** in the UI. Without the key, health and validation still work, while tutor requests return a safe configuration error.

## Deployment notes

Deploy the frontend and Express API together or configure the frontend proxy/API origin for separate services. Set `GEMINI_API_KEY`, `GEMINI_MODEL` (optional), and `PORT` in the deployment environment. Never commit `.env` files. Keep the deterministic evaluator unchanged unless its challenge tests are updated alongside it.
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
