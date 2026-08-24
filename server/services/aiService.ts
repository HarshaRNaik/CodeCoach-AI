import { GoogleGenAI } from "@google/genai";

import {
  explanationResponseSchema,
  hintResponseSchema,
  type ExplanationResponse,
  type HintResponse,
  type ProgrammingLanguage,
} from "../validation/schemas.js";

import type { ChallengeDefinition } from "../challenges.js";

/**
 * Gemini configuration
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
const AI_TIMEOUT_MS = 30_000;

/**
 * AI provider errors
 *
 * These errors allow the Express layer to distinguish between
 * rate limits, timeouts, invalid responses, and provider failures.
 */
export type AiErrorKind =
  | "rate-limit"
  | "timeout"
  | "invalid-response"
  | "provider";

export class AiProviderError extends Error {
  readonly status?: number;
  readonly kind: AiErrorKind;

  constructor(
    kind: AiErrorKind,
    message: string,
    status?: number,
  ) {
    super(message);

    this.name = "AiProviderError";
    this.kind = kind;
    this.status = status;
  }
}

/**
 * JSON schema sent to Gemini for hint responses.
 */
const hintJsonSchema = {
  type: "object",
  properties: {
    hint: {
      type: "string",
    },
    level: {
      type: "integer",
      minimum: 1,
      maximum: 3,
    },
  },
  required: ["hint", "level"],
  additionalProperties: false,
};

/**
 * JSON schema sent to Gemini for explanation responses.
 */
const explanationJsonSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
    },
    steps: {
      type: "array",
      items: {
        type: "string",
      },
    },
    issues: {
      type: "array",
      items: {
        type: "string",
      },
    },
    learningTakeaway: {
      type: "string",
    },
  },
  required: [
    "summary",
    "steps",
    "issues",
    "learningTakeaway",
  ],
  additionalProperties: false,
};

/**
 * Lazily create the Gemini client.
 *
 * Keeping client creation inside a function means the API key
 * is checked when an AI request is actually made.
 */
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({
    apiKey,
  });
}

/**
 * Extract an HTTP/provider status code from an unknown error.
 */
function getProviderStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const candidate = error as {
    status?: unknown;
    code?: unknown;
    response?: {
      status?: unknown;
    };
  };

  const status =
    candidate.status ??
    candidate.code ??
    candidate.response?.status;

  return typeof status === "number" ? status : undefined;
}

/**
 * Prevent API keys or excessively large provider errors
 * from appearing in logs.
 */
function getSafeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unknown provider error.";
  }

  return error.message
    .replace(/AIza[\w-]+/g, "[redacted]")
    .slice(0, 300);
}

/**
 * Build the challenge context shared by both AI operations.
 */
function buildChallengeContext(
  challenge: ChallengeDefinition,
  language: ProgrammingLanguage,
): string {
  return [
    `Challenge: ${challenge.title}`,
    `Difficulty: ${challenge.difficulty}`,
    `Language: ${language}`,
    `Task: ${challenge.description}`,
    `Example: ${challenge.example}`,
  ].join("\n");
}

/**
 * Build the prompt used for generating hints.
 */
function buildHintPrompt(
  challenge: ChallengeDefinition,
  code: string,
  level: number,
  language: ProgrammingLanguage,
): string {
  return `
You are a patient programming tutor helping a beginner.

Your job is to guide the learner rather than simply provide the solution.

Rules:
- Do not provide the complete solution unless explicitly requested.
- Base your response on the actual challenge and the student's code.
- Do not invent bugs that are not present.
- Keep the response concise and useful.
- Use ${language} terminology and syntax when discussing code.
- Always provide a useful hint.
- Return only the requested JSON object.

Hint levels:
- Level 1: Give a conceptual direction.
- Level 2: Give a specific strategy.
- Level 3: Give a strong implementation-oriented hint.

Requested hint level: ${level}

${buildChallengeContext(challenge, language)}

Student code:
${code}
`.trim();
}

/**
 * Build the prompt used for explaining code.
 */
function buildExplanationPrompt(
  challenge: ChallengeDefinition,
  code: string,
  language: ProgrammingLanguage,
): string {
  return `
You are a patient programming tutor helping a beginner.

Explain the student's actual code rather than replacing it with a
different solution.

Rules:
- Explain the approach step by step.
- Identify only genuine bugs or edge cases.
- Mention complexity when useful.
- Teach the underlying programming concept.
- Keep the explanation understandable and concise.
- Use ${language} terminology and syntax.
- Always provide a useful explanation.
- Return only the requested JSON object.

${buildChallengeContext(challenge, language)}

Student code:
${code}
`.trim();
}

/**
 * Parse and validate a hint response.
 */
export function parseHintResponse(
  text: string,
): HintResponse {
  try {
    const parsed: unknown = JSON.parse(text);

    return hintResponseSchema.parse(parsed);
  } catch {
    throw new AiProviderError(
      "invalid-response",
      "Gemini returned invalid hint data.",
    );
  }
}

/**
 * Parse and validate an explanation response.
 */
export function parseExplanationResponse(
  text: string,
): ExplanationResponse {
  try {
    const parsed: unknown = JSON.parse(text);

    return explanationResponseSchema.parse(parsed);
  } catch {
    throw new AiProviderError(
      "invalid-response",
      "Gemini returned invalid explanation data.",
    );
  }
}

/**
 * Generate structured JSON using Gemini.
 *
 * This function centralizes:
 * - Gemini configuration
 * - timeout handling
 * - provider error handling
 * - structured output
 * - response validation
 */
async function generateStructuredResponse<T>(options: {
  operation: "hint" | "explain";
  prompt: string;
  responseSchema: object;
  parseResponse: (text: string) => T;
}): Promise<T> {
  const {
    operation,
    prompt,
    responseSchema,
    parseResponse,
  } = options;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, AI_TIMEOUT_MS);

  try {
    let response;

    try {
      response = await getGeminiClient().models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,

        config: {
          abortSignal: controller.signal,
          temperature: 0.1,
          maxOutputTokens:
            operation === "explain" ? 1600 : 800,

          responseMimeType: "application/json",
          responseJsonSchema: responseSchema,
        },
      });
    } catch (error) {
      const status = getProviderStatus(error);

      let kind: AiErrorKind = "provider";

      if (status === 429) {
        kind = "rate-limit";
      } else if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        kind = "timeout";
      }

      console.error(`[ai:${operation}] Gemini request failed`, {
        kind,
        status,
        message: getSafeErrorMessage(error),
      });

      throw new AiProviderError(
        kind,
        `Gemini ${kind} failure.`,
        status,
      );
    }

    const text = response.text;

    if (!text) {
      console.error(
        `[ai:${operation}] Gemini returned empty output`,
      );

      throw new AiProviderError(
        "invalid-response",
        "Gemini returned empty output.",
      );
    }

    try {
      const result = parseResponse(text);

      console.info(
        `[ai:${operation}] Gemini response validated`,
        {
          model: GEMINI_MODEL,
        },
      );

      return result;
    } catch (error) {
      console.error(
        `[ai:${operation}] Gemini response validation failed`,
        {
          kind: "invalid-response",
          message: getSafeErrorMessage(error),
        },
      );

      throw new AiProviderError(
        "invalid-response",
        "Gemini returned invalid structured output.",
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Generate a contextual programming hint.
 */
export async function generateHint(
  challenge: ChallengeDefinition,
  code: string,
  level: number,
  language: ProgrammingLanguage,
): Promise<HintResponse> {
  const prompt = buildHintPrompt(
    challenge,
    code,
    level,
    language,
  );

  return generateStructuredResponse({
    operation: "hint",
    prompt,
    responseSchema: hintJsonSchema,
    parseResponse: parseHintResponse,
  });
}

/**
 * Explain the learner's submitted code.
 */
export async function explainCode(
  challenge: ChallengeDefinition,
  code: string,
  language: ProgrammingLanguage,
): Promise<ExplanationResponse> {
  const prompt = buildExplanationPrompt(
    challenge,
    code,
    language,
  );

  return generateStructuredResponse({
    operation: "explain",
    prompt,
    responseSchema: explanationJsonSchema,
    parseResponse: parseExplanationResponse,
  });
}