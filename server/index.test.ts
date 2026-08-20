import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp, type AiService } from "./app.js";

const validHint = { hint: "Think about what information you need to remember.", level: 1 };
const validExplanation = { summary: "The code scans the input.", steps: ["It starts at the first item."], issues: [], learningTakeaway: "Choose data structures deliberately." };
const service: AiService = { generateHint: vi.fn().mockResolvedValue(validHint), explainCode: vi.fn().mockResolvedValue(validExplanation) };

describe("CodeCoach API", () => {
  it("returns a health response without Gemini", async () => { const response = await request(createApp(service)).get("/api/health"); expect(response.status).toBe(200); expect(response.body).toEqual({ status: "ok" }); });
  it("validates and serves a hint", async () => { const response = await request(createApp(service)).post("/api/hint").send({ challengeId: "two-sum", code: "return [];", hintLevel: 1, language: "Python" }); expect(response.status).toBe(200); expect(response.body).toEqual(validHint); });
  it("rejects empty code and invalid levels", async () => { const response = await request(createApp(service)).post("/api/hint").send({ challengeId: "two-sum", code: "", hintLevel: 4, language: "JavaScript" }); expect(response.status).toBe(400); expect(response.body.error).toBeTruthy(); });
  it("returns 404 for an unknown challenge", async () => { const response = await request(createApp(service)).post("/api/explain").send({ challengeId: "unknown", code: "const value = 1;", language: "JavaScript" }); expect(response.status).toBe(404); });
  it("serves a structured explanation", async () => { const response = await request(createApp(service)).post("/api/explain").send({ challengeId: "two-sum", code: "return [];", language: "Java" }); expect(response.status).toBe(200); expect(response.body).toEqual(validExplanation); });
  it("normalizes Gemini failures", async () => { const failingService: AiService = { ...service, generateHint: vi.fn().mockRejectedValue(new Error("provider down")) }; const response = await request(createApp(failingService)).post("/api/hint").send({ challengeId: "two-sum", code: "return [];", hintLevel: 1, language: "C++" }); expect(response.status).toBe(500); expect(response.body).toEqual({ error: "The AI service could not process this request." }); });
  it("runs the deterministic evaluator without Gemini", async () => { const response = await request(createApp(service)).post("/api/run").send({ challengeId: "hello-world", code: 'console.log("Hello, World!");', language: "JavaScript" }); expect(response.status).toBe(200); expect(response.body.results[0].passed).toBe(true); });
  it("rejects malformed run requests", async () => { const response = await request(createApp(service)).post("/api/run").send({ challengeId: "hello-world", code: "", language: "JavaScript" }); expect(response.status).toBe(400); });
});
