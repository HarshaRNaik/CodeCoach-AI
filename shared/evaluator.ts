export type SupportedLanguage = "JavaScript" | "TypeScript" | "Python" | "Java" | "C++" | "Go" | "C#" | "Ruby" | "PHP" | "Kotlin" | "Rust" | "Swift" | "C" | "Dart" | "Scala" | "R" | "Bash";

export type TestResult = { label: string; passed: boolean; expected: string; received: string };

export type EvaluatorChallenge = { id: string };

export function evaluateChallenge(challenge: EvaluatorChallenge, code: string, language: SupportedLanguage): TestResult[] {
  const normalized = code.toLowerCase();
  const outputCall = language === "Python" ? normalized.includes("print") : language === "Java" ? normalized.includes("system.out") : language === "C++" ? normalized.includes("cout") : language === "Go" ? normalized.includes("fmt.") : language === "C#" ? normalized.includes("console.write") : language === "Ruby" ? normalized.includes("puts") : language === "PHP" ? normalized.includes("echo") : language === "Kotlin" ? normalized.includes("println") : language === "Rust" ? normalized.includes("println!") : language === "Swift" ? normalized.includes("print") : language === "C" ? normalized.includes("printf") : language === "Dart" ? normalized.includes("print") : language === "Scala" ? normalized.includes("println") : language === "R" ? normalized.includes("print") || normalized.includes("cat") : language === "Bash" ? normalized.includes("echo") || normalized.includes("printf") : normalized.includes("console.log");
  const checks: Record<string, boolean[]> = {
    "hello-world": [outputCall && code.includes("Hello, World!")],
    variables: [normalized.includes("name") && normalized.includes("age"), outputCall || normalized.includes("return")],
    "two-sum": [normalized.includes("target") && (normalized.includes("return") || normalized.includes("returning")), normalized.includes("map") || normalized.includes("hash") || normalized.includes("unordered_map")],
    palindrome: [normalized.includes("return") && (normalized.includes("palindrome") || normalized.includes("word") || normalized.includes("string")), normalized.includes("reverse") || normalized.includes("reversed") || normalized.includes("split") || normalized.includes("[i]")],
    fizzbuzz: [normalized.includes("%") && normalized.includes("number"), normalized.includes("15") && (normalized.includes("100") || normalized.includes("101"))],
    "reverse-string": [normalized.includes("return") && (normalized.includes("reverse") || normalized.includes("reversed")), normalized.includes("split") || normalized.includes("[::-1]") || normalized.includes("reverse")],
    factorial: [normalized.includes("factorial") && (normalized.includes("return") || normalized.includes("def ")), normalized.includes("for") || normalized.includes("while") || normalized.includes("range")],
    "count-vowels": [normalized.includes("vowel") || normalized.includes("aeiou"), normalized.includes("count") || normalized.includes("includes") || normalized.includes("in ")],
    "data-types": [normalized.includes("name") && normalized.includes("alice"), normalized.includes("age") && normalized.includes("30"), normalized.includes("student") || normalized.includes("isstudent")],
    "swap-variables": [normalized.includes("a") && normalized.includes("b"), normalized.includes("=") && (normalized.includes("temp") || (normalized.includes("a") && normalized.includes("b") && code.split("=").length > 3))],
    "character-frequency": [normalized.includes("character") || normalized.includes("frequency") || normalized.includes("count"), normalized.includes("map") || normalized.includes("dict") || normalized.includes("object") || normalized.includes("hashmap")],
    "find-maximum": [normalized.includes("maximum") || normalized.includes("max"), normalized.includes("return") && (normalized.includes("numbers") || normalized.includes("array"))],
    "remove-duplicates": [normalized.includes("duplicate") || normalized.includes("unique"), normalized.includes("return") && (normalized.includes("array") || normalized.includes("list"))],
    "fibonacci": [normalized.includes("fibonacci") || normalized.includes("fib"), normalized.includes("return") && (normalized.includes("for") || normalized.includes("while") || normalized.includes("recursion") || code.split("fibonacci").length > 1)],
    "prime-number": [normalized.includes("prime"), normalized.includes("return") && (normalized.includes("true") || normalized.includes("false"))],
    "linear-search": [normalized.includes("search") || normalized.includes("index"), normalized.includes("return") && (normalized.includes("-1") || normalized.includes("index"))],
  };
  return (checks[challenge.id] ?? []).map((passed, index) => ({ label: `Test ${index + 1}`, passed, expected: challenge.id === "two-sum" ? "[0, 1]" : "Expected behavior", received: passed ? "Matches expected behavior" : "No matching result yet" }));
}
