import "dotenv/config";
import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import { findChallenge } from "./challenges.js";
import { explainCode, generateHint } from "./services/aiService.js";
import { explainRequestSchema, hintRequestSchema, type ExplanationResponse, type HintResponse, type ProgrammingLanguage } from "./validation/schemas.js";

export type AiService = {
  generateHint: (challenge: NonNullable<ReturnType<typeof findChallenge>>, code: string, level: number, language: ProgrammingLanguage) => Promise<HintResponse>;
  explainCode: (challenge: NonNullable<ReturnType<typeof findChallenge>>, code: string, language: ProgrammingLanguage) => Promise<ExplanationResponse>;
};

const defaultAiService: AiService = { generateHint, explainCode };
const asyncRoute = (handler: RequestHandler): RequestHandler => (request, response, next) => { Promise.resolve(handler(request, response, next)).catch(next); };

export function createApp(aiService: AiService = defaultAiService) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "20kb" }));

  app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

  app.post("/api/hint", asyncRoute(async (request, response) => {
    const parsed = hintRequestSchema.safeParse(request.body);
    if (!parsed.success) { response.status(400).json({ error: "Provide a valid challenge, code, and hint level from 1 to 3." }); return; }
    const challenge = findChallenge(parsed.data.challengeId);
    if (!challenge) { response.status(404).json({ error: "That challenge could not be found." }); return; }
    const result = await aiService.generateHint(challenge, parsed.data.code, parsed.data.hintLevel, parsed.data.language);
    response.json(result);
  }));

  app.post("/api/explain", asyncRoute(async (request, response) => {
    const parsed = explainRequestSchema.safeParse(request.body);
    if (!parsed.success) { response.status(400).json({ error: "Provide a valid challenge and some code to explain." }); return; }
    const challenge = findChallenge(parsed.data.challengeId);
    if (!challenge) { response.status(404).json({ error: "That challenge could not be found." }); return; }
    const result = await aiService.explainCode(challenge, parsed.data.code, parsed.data.language);
    response.json(result);
  }));

  const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
    void next;
    if (error instanceof SyntaxError) { response.status(400).json({ error: "Request body must be valid JSON." }); return; }
    if (error instanceof Error && error.name === "AbortError") { response.status(504).json({ error: "The tutor took too long to respond. Please try again." }); return; }
    const message = error instanceof Error ? error.message : "Unknown server error.";
    if (message.includes("GEMINI_API_KEY")) { response.status(500).json({ error: "AI tutoring is not configured on the server." }); return; }
    response.status(502).json({ error: "The tutor is unavailable right now. Please try again." });
  };
  app.use(errorHandler);
  return app;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 3001);
  createApp().listen(port, () => console.log(`CodeCoach API listening on port ${port}`));
}
