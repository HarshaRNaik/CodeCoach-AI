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

const hintJsonSchema = {
  type: "object",
  properties: { hint: { type: "string" }, level: { type: "integer", minimum: 1, maximum: 3 } },
  required: ["hint", "level"],
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
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  return new GoogleGenAI({ apiKey });
}

async function generateJson<T>(prompt: string, schema: object, parse: (value: unknown) => T): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await getClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        abortSignal: controller.signal,
        temperature: 0.2,
        maxOutputTokens: 700,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
      },
    });
    const text = response.text;
    if (!text) throw new Error("Gemini returned an empty response.");
    return parse(JSON.parse(text));
  } finally {
    clearTimeout(timeout);
  }
}

function challengeContext(challenge: ChallengeDefinition, language: ProgrammingLanguage): string {
  return `Challenge: ${challenge.title}\nDifficulty: ${challenge.difficulty}\nLanguage: ${language}\nTask: ${challenge.description}\nExample: ${challenge.example}`;
}

export async function generateHint(challenge: ChallengeDefinition, code: string, level: number, language: ProgrammingLanguage): Promise<HintResponse> {
  const prompt = `You are a patient programming tutor for a beginner. Act as a tutor, not a solution generator. Do not provide the complete solution unless explicitly requested. Base your response on the actual challenge and the student's current code. Do not invent bugs that are not present. Keep the response concise and match hint level ${level}: level 1 is conceptual, level 2 is a specific strategy, level 3 is a strong implementation-oriented hint. Use ${language} terminology and syntax when mentioning code. Always return a useful hint, never say that you are unavailable or unable to answer. Return only the requested JSON object.\n\n${challengeContext(challenge, language)}\nStudent code:\n${code}`;
  return generateJson(prompt, hintJsonSchema, (value) => hintResponseSchema.parse(value));
}

export async function explainCode(challenge: ChallengeDefinition, code: string, language: ProgrammingLanguage): Promise<ExplanationResponse> {
  const prompt = `You are a patient programming tutor for a beginner. Explain the student's actual code, not a replacement solution. Explain the approach step by step, identify only genuine bugs or edge cases, mention complexity where useful, and teach the underlying concept. Keep it understandable and concise. Use ${language} terminology and syntax. Always return a useful explanation, never say that you are unavailable or unable to answer. Return only the requested JSON object.\n\n${challengeContext(challenge, language)}\nStudent code:\n${code}`;
  return generateJson(prompt, explanationJsonSchema, (value) => explanationResponseSchema.parse(value));
}
