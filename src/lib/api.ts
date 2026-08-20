export type HintResponse = { hint: string; level: number };
export type ExplanationResponse = { summary: string; steps: string[]; issues: string[]; learningTakeaway: string };
export type ProgrammingLanguage = "JavaScript" | "TypeScript" | "Python" | "Java" | "C++" | "Go";

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new Error("Unable to reach the tutor right now. Please try again.");
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string" ? payload.error : "The tutor is unavailable right now. Please try again.";
    throw new Error(error);
  }
  return payload as T;
}

export function requestHint(challengeId: string, code: string, hintLevel: number, language: ProgrammingLanguage): Promise<HintResponse> {
  return post<HintResponse>("/api/hint", { challengeId, code, hintLevel, language });
}

export function requestExplanation(challengeId: string, code: string, language: ProgrammingLanguage): Promise<ExplanationResponse> {
  return post<ExplanationResponse>("/api/explain", { challengeId, code, language });
}
