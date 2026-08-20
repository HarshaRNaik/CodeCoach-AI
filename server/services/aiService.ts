import { GoogleGenAI } from "@google/genai";
import {
  explanationResponseSchema,
  hintResponseSchema,
  type ExplanationResponse,
  type HintResponse,
  type ProgrammingLanguage,
} from "../validation/schemas.js";
import type { ChallengeDefinition } from "../challenges.js";

const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
const timeoutMs = 30000;

export class AiProviderError extends Error {
  readonly status: number | undefined;
  readonly kind: "rate-limit" | "timeout" | "invalid-response" | "provider";

  constructor(kind: AiProviderError["kind"], message: string, status?: number) {
    super(message);
    this.name = "AiProviderError";
    this.kind = kind;
    this.status = status;
  }
}

const hintJsonSchema = {
  type: "object",
  properties: { hint: { type: "string" }, level: { type: "integer", minimum: 1, maximum: 3 } },
  required: ["hint", "level"],
  additionalProperties: false,
};

const explanationJsonSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    steps: { type: "array", items: { type: "string" } },
    issues: { type: "array", items: { type: "string" } },
    learningTakeaway: { type: "string" },
  },
  required: ["summary", "steps", "issues", "learningTakeaway"],
  additionalProperties: false,
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  return new GoogleGenAI({ apiKey });
}

function providerStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { status?: unknown; code?: unknown; response?: { status?: unknown } };
  const status = candidate.status ?? candidate.code ?? candidate.response?.status;
  return typeof status === "number" ? status : undefined;
}

function safeProviderMessage(error: unknown): string {
  if (error instanceof Error) return error.message.replace(/AIza[\w-]+/g, "[redacted]").slice(0, 300);
  return "Unknown provider error";
}

export function parseHintResponse(text: string): HintResponse {
  return hintResponseSchema.parse(JSON.parse(text));
}

export function parseExplanationResponse(text: string): ExplanationResponse {
  return explanationResponseSchema.parse(JSON.parse(text));
}

async function generateJson<T>(endpoint: "hint" | "explain", prompt: string, schema: object, parse: (value: unknown) => T): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response;
    try {
      response = await getClient().models.generateContent({ model, contents: prompt, config: { abortSignal: controller.signal, temperature: 0.1, maxOutputTokens: endpoint === "explain" ? 1600 : 800, responseMimeType: "application/json", responseJsonSchema: schema } });
    } catch (error) {
      const status = providerStatus(error);
      const kind = status === 429 ? "rate-limit" : error instanceof Error && error.name === "AbortError" ? "timeout" : "provider";
      console.error(`[ai:${endpoint}] Gemini request failed`, { kind, status, message: safeProviderMessage(error) });
      throw new AiProviderError(kind, `Gemini ${kind} failure.`, status);
    }
    const text = response.text;
    console.info(`[ai:${endpoint}] Gemini response received`, { hasText: Boolean(text), model });
    if (!text) { console.error(`[ai:${endpoint}] Gemini returned empty structured output`); throw new AiProviderError("invalid-response", "Gemini returned empty output."); }
    try {
      return parse(JSON.parse(text));
    } catch (error) {
      console.error(`[ai:${endpoint}] Gemini response validation failed`, { kind: "invalid-response", message: safeProviderMessage(error) });
      throw new AiProviderError("invalid-response", "Gemini returned invalid structured output.");
    }
  } finally {
    clearTimeout(timeout);
  }
}

function challengeContext(challenge: ChallengeDefinition, language: ProgrammingLanguage): string {
  return `Challenge: ${challenge.title}\nDifficulty: ${challenge.difficulty}\nLanguage: ${language}\nTask: ${challenge.description}\nExample: ${challenge.example}`;
}

export async function generateHint(challenge: ChallengeDefinition, code: string, level: number, language: ProgrammingLanguage): Promise<HintResponse> {
  const prompt = `You are a patient programming tutor for a beginner. Act as a tutor, not a solution generator. Do not provide the complete solution unless explicitly requested. Base your response on the actual challenge and the student's current code. Do not invent bugs that are not present. Keep the response concise and match hint level ${level}: level 1 is conceptual, level 2 is a specific strategy, level 3 is a strong implementation-oriented hint. Use ${language} terminology and syntax when mentioning code. Always return a useful hint, never say that you are unavailable or unable to answer. Return only the requested JSON object.\n\n${challengeContext(challenge, language)}\nStudent code:\n${code}`;
  return generateJson("hint", prompt, hintJsonSchema, (value) => hintResponseSchema.parse(value));
}

export async function explainCode(challenge: ChallengeDefinition, code: string, language: ProgrammingLanguage): Promise<ExplanationResponse> {
  const prompt = `You are a patient programming tutor for a beginner. Explain the student's actual code, not a replacement solution. Explain the approach step by step, identify only genuine bugs or edge cases, mention complexity where useful, and teach the underlying concept. Keep it understandable and concise. Use ${language} terminology and syntax. Always return a useful explanation, never say that you are unavailable or unable to answer. Return only the requested JSON object.\n\n${challengeContext(challenge, language)}\nStudent code:\n${code}`;
  return generateJson("explain", prompt, explanationJsonSchema, (value) => explanationResponseSchema.parse(value));
}
