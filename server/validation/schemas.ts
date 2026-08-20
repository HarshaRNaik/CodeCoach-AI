import { z } from "zod";

export const languageSchema = z.enum(["JavaScript", "TypeScript", "Python", "Java", "C++", "Go"]);

export const hintRequestSchema = z.object({
  challengeId: z.string().trim().min(1),
  code: z.string().trim().min(1, "Code must not be empty.").max(12000, "Code is too long."),
  hintLevel: z.number().int().min(1).max(3),
  language: languageSchema,
});

export const explainRequestSchema = z.object({
  challengeId: z.string().trim().min(1),
  code: z.string().trim().min(1, "Code must not be empty.").max(12000, "Code is too long."),
  language: languageSchema,
});

export const hintResponseSchema = z.object({
  hint: z.string().trim().min(1).max(1000),
  level: z.number().int().min(1).max(3),
});

export const explanationResponseSchema = z.object({
  summary: z.string().trim().min(1).max(2000),
  steps: z.array(z.string().trim().min(1).max(1000)).min(1).max(8),
  issues: z.array(z.string().trim().min(1).max(1000)).max(8),
  learningTakeaway: z.string().trim().min(1).max(1000),
});

export type HintRequest = z.infer<typeof hintRequestSchema>;
export type ExplainRequest = z.infer<typeof explainRequestSchema>;
export type HintResponse = z.infer<typeof hintResponseSchema>;
export type ExplanationResponse = z.infer<typeof explanationResponseSchema>;
export type ProgrammingLanguage = z.infer<typeof languageSchema>;
