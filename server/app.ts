import "dotenv/config";
import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import { findChallenge } from "./challenges.js";
import { explainCode, generateHint } from "./services/aiService.js";
import { evaluateChallenge } from "../shared/evaluator.js";
import { explainRequestSchema, hintRequestSchema, runRequestSchema, type ExplanationResponse, type HintResponse, type ProgrammingLanguage } from "./validation/schemas.js";

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
    if (!parsed.success) { response.status(400).json({ error: "Invalid hint request." }); return; }
    const challenge = findChallenge(parsed.data.challengeId);
    if (!challenge) { response.status(404).json({ error: "Unknown challenge." }); return; }
    response.json(await aiService.generateHint(challenge, parsed.data.code, parsed.data.hintLevel, parsed.data.language));
  }));

  app.post("/api/explain", asyncRoute(async (request, response) => {
    const parsed = explainRequestSchema.safeParse(request.body);
    if (!parsed.success) { response.status(400).json({ error: "Invalid explanation request." }); return; }
    const challenge = findChallenge(parsed.data.challengeId);
    if (!challenge) { response.status(404).json({ error: "Unknown challenge." }); return; }
    response.json(await aiService.explainCode(challenge, parsed.data.code, parsed.data.language));
  }));

  app.post("/api/run", (request, response) => {
    const parsed = runRequestSchema.safeParse(request.body);
    if (!parsed.success) { response.status(400).json({ error: "Invalid run request." }); return; }
    const challenge = findChallenge(parsed.data.challengeId);
    if (!challenge) { response.status(404).json({ error: "Unknown challenge." }); return; }
    response.json({ results: evaluateChallenge(challenge, parsed.data.code, parsed.data.language) });
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
    void next;
    if (error instanceof SyntaxError) { response.status(400).json({ error: "Request body must be valid JSON." }); return; }
    if (error instanceof Error && error.name === "AbortError") { response.status(504).json({ error: "The tutor request timed out. Please try again." }); return; }
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) { response.status(500).json({ error: "AI tutoring is not configured." }); return; }
    response.status(500).json({ error: "The AI service could not process this request." });
  };
  app.use(errorHandler);
  return app;
}
