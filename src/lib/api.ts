export type HintResponse = { hint: string; level: number };
export type ExplanationResponse = { summary: string; steps: string[]; issues: string[]; learningTakeaway: string };
export type ProgrammingLanguage = "JavaScript" | "TypeScript" | "Python" | "Java" | "C++" | "Go";
import type { TestResult } from "../../shared/evaluator";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new Error("Unable to reach the tutor right now. Please try again.");
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string" ? payload.error : "The API could not complete this request.";
    throw new ApiError(response.status, error);
  }
  if (!payload || typeof payload !== "object") throw new ApiError(response.status, "The API returned an invalid response.");
  return payload as T;
}

async function get<T>(path: string): Promise<T> {
  let response: Response;
  try { response = await fetch(path); } catch { throw new ApiError(0, "Unable to reach the API."); }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, "The API could not complete this request.");
  if (!payload || typeof payload !== "object") throw new ApiError(response.status, "The API returned an invalid response.");
  return payload as T;
}

export function requestHint(challengeId: string, code: string, hintLevel: number, language: ProgrammingLanguage): Promise<HintResponse> {
  return post<HintResponse>("/api/hint", { challengeId, code, hintLevel, language });
}

export function requestExplanation(challengeId: string, code: string, language: ProgrammingLanguage): Promise<ExplanationResponse> {
  return post<ExplanationResponse>("/api/explain", { challengeId, code, language });
}

export async function requestRun(challengeId: string, code: string, language: ProgrammingLanguage): Promise<TestResult[]> {
  const response = await post<{ results: TestResult[] }>("/api/run", { challengeId, code, language });
  return response.results;
}

export function requestHealth(): Promise<{ status: "ok" }> {
  return get<{ status: "ok" }>("/api/health");
}
