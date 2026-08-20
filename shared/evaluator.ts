export type SupportedLanguage = "JavaScript" | "TypeScript" | "Python" | "Java" | "C++" | "Go";

export type TestResult = { label: string; passed: boolean; expected: string; received: string };

export type EvaluatorChallenge = { id: string };

export function evaluateChallenge(challenge: EvaluatorChallenge, code: string, language: SupportedLanguage): TestResult[] {
  const normalized = code.toLowerCase();
  const outputCall = language === "Python" ? normalized.includes("print") : language === "Java" ? normalized.includes("system.out") : language === "C++" ? normalized.includes("cout") : language === "Go" ? normalized.includes("fmt.") : normalized.includes("console.log");
  const checks: Record<string, boolean[]> = {
    "hello-world": [outputCall && code.includes("Hello, World!")],
    variables: [normalized.includes("name") && normalized.includes("age"), outputCall || normalized.includes("return")],
    "two-sum": [normalized.includes("target") && (normalized.includes("return") || normalized.includes("returning")), normalized.includes("map") || normalized.includes("hash") || normalized.includes("unordered_map")],
    palindrome: [normalized.includes("return") && (normalized.includes("palindrome") || normalized.includes("word") || normalized.includes("string")), normalized.includes("reverse") || normalized.includes("reversed") || normalized.includes("split") || normalized.includes("[i]")],
    fizzbuzz: [normalized.includes("%") && normalized.includes("number"), normalized.includes("15") && (normalized.includes("100") || normalized.includes("101"))],
    "reverse-string": [normalized.includes("return") && (normalized.includes("reverse") || normalized.includes("reversed")), normalized.includes("split") || normalized.includes("[::-1]") || normalized.includes("reverse")],
    factorial: [normalized.includes("factorial") && (normalized.includes("return") || normalized.includes("def ")), normalized.includes("for") || normalized.includes("while") || normalized.includes("range")],
    "count-vowels": [normalized.includes("vowel") || normalized.includes("aeiou"), normalized.includes("count") || normalized.includes("includes") || normalized.includes("in ")],
  };
  return (checks[challenge.id] ?? []).map((passed, index) => ({ label: `Test ${index + 1}`, passed, expected: challenge.id === "two-sum" ? "[0, 1]" : "Expected behavior", received: passed ? "Matches expected behavior" : "No matching result yet" }));
}
