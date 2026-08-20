import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Code2,
  Info,
  Lightbulb,
  Menu,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import "./App.css";
import { requestExplanation, requestHint, requestRun, type ExplanationResponse, type ProgrammingLanguage } from "./lib/api";
import { type TestResult } from "../shared/evaluator";

type Challenge = {
  id: string;
  title: string;
  difficulty: "Easy" | "Easy / Medium";
  description: string;
  example: string;
  starter: string;
  concept: string;
};

const languages: ProgrammingLanguage[] = ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go"];

const languageStarters: Record<ProgrammingLanguage, Record<string, string>> = {
  JavaScript: {
    "hello-world": `// Print the message below\nconsole.log("Hello, World!");`, variables: `const name = "Ada";\nconst age = 28;\n\n// Display a sentence using both variables`, "two-sum": `function twoSum(numbers, target) {\n  // Return the indices of the two matching numbers\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`, palindrome: `function isPalindrome(word) {\n  // Return true when word reads the same backwards\n}\n\nconsole.log(isPalindrome("madam"));`, fizzbuzz: `for (let number = 1; number <= 100; number++) {\n  // Check divisibility before printing the number\n}`, "reverse-string": `function reverseString(word) {\n  // Return word with its characters reversed\n}`, factorial: `function factorial(number) {\n  // Return the product of every integer from 1 to number\n}`, "count-vowels": `function countVowels(word) {\n  // Return how many vowels appear in word\n}`,
  },
  Python: {
    "hello-world": `# Print the message below\nprint("Hello, World!")`, variables: `name = "Ada"\nage = 28\n\n# Display a sentence using both variables`, "two-sum": `def two_sum(numbers, target):\n    # Return the indices of the two matching numbers\n    pass\n\nprint(two_sum([2, 7, 11, 15], 9))`, palindrome: `def is_palindrome(word):\n    # Return True when word reads the same backwards\n    pass\n\nprint(is_palindrome("madam"))`, fizzbuzz: `for number in range(1, 101):\n    # Check divisibility before printing the number\n    pass`, "reverse-string": `def reverse_string(word):\n    # Return word with its characters reversed\n    pass`, factorial: `def factorial(number):\n    # Return the product of every integer from 1 to number\n    pass`, "count-vowels": `def count_vowels(word):\n    # Return how many vowels appear in word\n    pass`,
  },
  TypeScript: {
    "hello-world": `// Print the message below\nconsole.log("Hello, World!");`, variables: `const name: string = "Ada";\nconst age: number = 28;\n\n// Display a sentence using both variables`, "two-sum": `function twoSum(numbers: number[], target: number): number[] {\n  // Return the indices of the two matching numbers\n  return [];\n}`, palindrome: `function isPalindrome(word: string): boolean {\n  // Return true when word reads the same backwards\n  return false;\n}`, fizzbuzz: `for (let number = 1; number <= 100; number++) {\n  // Check divisibility before printing the number\n}`, "reverse-string": `function reverseString(word: string): string {\n  // Return word with its characters reversed\n  return "";\n}`, factorial: `function factorial(number: number): number {\n  // Return the product of every integer from 1 to number\n  return 0;\n}`, "count-vowels": `function countVowels(word: string): number {\n  // Return how many vowels appear in word\n  return 0;\n}`,
  },
  Java: {
    "hello-world": `class Main {\n  public static void main(String[] args) {\n    // Print the message below\n  }\n}`, variables: `class Main {\n  public static void main(String[] args) {\n    String name = "Ada";\n    int age = 28;\n    // Display a sentence using both variables\n  }\n}`, "two-sum": `class Main {\n  static int[] twoSum(int[] numbers, int target) {\n    // Return the indices of the two matching numbers\n    return new int[]{};\n  }\n}`, palindrome: `class Main {\n  static boolean isPalindrome(String word) {\n    // Return true when word reads the same backwards\n    return false;\n  }\n}`, fizzbuzz: `class Main {\n  public static void main(String[] args) {\n    // Check divisibility before printing each number\n  }\n}`, "reverse-string": `class Main {\n  static String reverseString(String word) {\n    // Return word with its characters reversed\n    return "";\n  }\n}`, factorial: `class Main {\n  static int factorial(int number) {\n    // Return the product of every integer from 1 to number\n    return 0;\n  }\n}`, "count-vowels": `class Main {\n  static int countVowels(String word) {\n    // Return how many vowels appear in word\n    return 0;\n  }\n}`,
  },
  "C++": {
    "hello-world": `#include <iostream>\nint main() {\n  // Print the message below\n}`, variables: `#include <iostream>\n#include <string>\nint main() {\n  std::string name = "Ada";\n  int age = 28;\n  // Display a sentence using both variables\n}`, "two-sum": `#include <vector>\nstd::vector<int> twoSum(std::vector<int> numbers, int target) {\n  // Return the indices of the two matching numbers\n  return {};\n}`, palindrome: `#include <string>\nbool isPalindrome(std::string word) {\n  // Return true when word reads the same backwards\n  return false;\n}`, fizzbuzz: `#include <iostream>\nint main() {\n  // Check divisibility before printing each number\n}`, "reverse-string": `#include <string>\nstd::string reverseString(std::string word) {\n  // Return word with its characters reversed\n  return "";\n}`, factorial: `int factorial(int number) {\n  // Return the product of every integer from 1 to number\n  return 0;\n}`, "count-vowels": `#include <string>\nint countVowels(std::string word) {\n  // Return how many vowels appear in word\n  return 0;\n}`,
  },
  Go: {
    "hello-world": `package main\nimport "fmt"\nfunc main() {\n  // Print the message below\n}`, variables: `package main\nimport "fmt"\nfunc main() {\n  name := "Ada"\n  age := 28\n  // Display a sentence using both variables\n  _ = fmt.Sprintf`, "two-sum": `func twoSum(numbers []int, target int) []int {\n  // Return the indices of the two matching numbers\n  return []int{}\n}`, palindrome: `func isPalindrome(word string) bool {\n  // Return true when word reads the same backwards\n  return false\n}`, fizzbuzz: `package main\nfunc main() {\n  // Check divisibility before printing each number\n}`, "reverse-string": `func reverseString(word string) string {\n  // Return word with its characters reversed\n  return ""\n}`, factorial: `func factorial(number int) int {\n  // Return the product of every integer from 1 to number\n  return 0\n}`, "count-vowels": `func countVowels(word string) int {\n  // Return how many vowels appear in word\n  return 0\n}`,
  },
};

const challenges: Challenge[] = [
  { id: "hello-world", title: "Hello World", difficulty: "Easy", description: "Write a program that prints the exact message Hello, World! to the console.", example: 'Output: "Hello, World!"', starter: `// Print the message below\nconsole.log("Hello, World!");`, concept: "console output" },
  { id: "variables", title: "Variables", difficulty: "Easy", description: "Create variables for a person's name and age, then display them in a readable sentence.", example: 'name = "Ada", age = 28 → "Ada is 28 years old."', starter: `const name = "Ada";\nconst age = 28;\n\n// Display a sentence using both variables`, concept: "variables and strings" },
  { id: "two-sum", title: "Two Sum", difficulty: "Easy / Medium", description: "Given an array of integers and a target, return the indices of two numbers that add up to the target.", example: "[2, 7, 11, 15], target 9 → [0, 1]", starter: `function twoSum(numbers, target) {\n  // Return the indices of the two matching numbers\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`, concept: "hash maps" },
  { id: "palindrome", title: "Palindrome", difficulty: "Easy", description: "Determine whether a given string reads the same forwards and backwards.", example: '"madam" → true · "hello" → false', starter: `function isPalindrome(word) {\n  // Return true when word reads the same backwards\n}\n\nconsole.log(isPalindrome("madam"));`, concept: "string traversal" },
  { id: "fizzbuzz", title: "FizzBuzz", difficulty: "Easy", description: "For numbers 1 through 100, print Fizz, Buzz, FizzBuzz, or the number based on its divisibility.", example: "3 → Fizz · 5 → Buzz · 15 → FizzBuzz", starter: `for (let number = 1; number <= 100; number++) {\n  // Check divisibility before printing the number\n}`, concept: "conditionals and loops" },
  { id: "reverse-string", title: "Reverse a String", difficulty: "Easy", description: "Return a new string with the characters of the input arranged in reverse order.", example: '"code" → "edoc"', starter: `function reverseString(word) {\n  // Return word with its characters reversed\n}`, concept: "string manipulation" },
  { id: "factorial", title: "Factorial", difficulty: "Easy", description: "Calculate the factorial of a non-negative integer by multiplying all integers from 1 through that number.", example: "5 → 120", starter: `function factorial(number) {\n  // Return the product of every integer from 1 to number\n}`, concept: "iteration" },
  { id: "count-vowels", title: "Count Vowels", difficulty: "Easy", description: "Count how many vowels appear in a string. Treat a, e, i, o, and u as vowels.", example: '"education" → 5', starter: `function countVowels(word) {\n  // Return how many vowels appear in word\n}`, concept: "character checks" },
];

function App() {
  const [selectedId, setSelectedId] = useState("two-sum");
  const [language, setLanguage] = useState<ProgrammingLanguage>(() => (localStorage.getItem("codecoach-language") as ProgrammingLanguage | null) ?? "JavaScript");
  const [codeByChallenge, setCodeByChallenge] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("codecoach-code") ?? "{}"); } catch { return {}; }
  });
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("codecoach-completed") ?? "[]"); } catch { return []; }
  });
  const [hintLevel, setHintLevel] = useState(0);
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<"run" | "hint" | "explain" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"practice" | "progress" | "settings">("practice");
  const challenge = useMemo(() => challenges.find((item) => item.id === selectedId) ?? challenges[0], [selectedId]);
  const codeKey = `${language}:${selectedId}`;
  const code = codeByChallenge[codeKey] ?? languageStarters[language][selectedId] ?? challenge.starter;
  const progress = completed.length;
  const totalChallenges = challenges.length;

  useEffect(() => { localStorage.setItem("codecoach-code", JSON.stringify(codeByChallenge)); }, [codeByChallenge]);
  useEffect(() => { localStorage.setItem("codecoach-completed", JSON.stringify(completed)); }, [completed]);
  useEffect(() => { localStorage.setItem("codecoach-language", language); }, [language]);

  const selectChallenge = (id: string) => { setSelectedId(id); setHintLevel(0); setHint(""); setExplanation(null); setResults(null); setMessage(""); setMobileOpen(false); };
  const updateCode = (value: string) => setCodeByChallenge((current) => ({ ...current, [codeKey]: value }));
  const changeLanguage = (nextLanguage: ProgrammingLanguage) => { setLanguage(nextLanguage); setHint(""); setExplanation(null); setResults(null); setMessage(""); };
  const goTo = (section: "practice" | "progress" | "settings") => { setActiveSection(section); setProfileOpen(false); document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" }); };
  const runCode = async () => {
    if (!code.trim()) { setMessage("Write some code before running tests."); setResults(null); return; }
    setLoading("run"); setMessage(""); setHint(""); setExplanation(null);
    try {
      const nextResults = await requestRun(selectedId, code, language);
      setResults(nextResults);
      if (nextResults.every((item) => item.passed)) setCompleted((current) => current.includes(selectedId) ? current : [...current, selectedId]);
    } catch {
      setMessage("Your code is still here. Check the API connection and try running the tests again.");
    } finally { setLoading(null); }
  };
  const getHint = async () => {
    if (!code.trim()) { setMessage("Write some code before requesting a hint."); return; }
    if (hintLevel >= 3) { setMessage("You have reached the strongest hint. Try explaining your approach next."); return; }
    setLoading("hint"); setMessage(""); setExplanation(null);
    try {
      const response = await requestHint(selectedId, code, hintLevel + 1, language);
      setHintLevel(response.level);
      setHint(response.hint);
    } catch {
      setMessage("Your code is still here. Check the API connection and try the hint again.");
    } finally { setLoading(null); }
  };
  const explainCode = async () => {
    if (!code.trim()) { setMessage("Write some code before asking for an explanation."); return; }
    setLoading("explain"); setMessage(""); setHint("");
    try {
      setExplanation(await requestExplanation(selectedId, code, language));
    } catch {
      setMessage("Your code is still here. Check the API connection and try the explanation again.");
    } finally { setLoading(null); }
  };

  return (
    <div className="app-shell">
      <header className="topbar" id="settings">
        <div className="brand"><span className="brand-mark"><Code2 size={19} /></span><span>codecoach<span className="brand-accent">.ai</span></span></div>
        <nav className="topnav" aria-label="Primary navigation"><button className="active" onClick={() => goTo("practice")}>Practice</button><button onClick={() => goTo("progress")}>Progress</button><button onClick={() => goTo("settings")}>Settings</button></nav>
        <div className="header-progress"><span>{progress}/{totalChallenges} complete</span><div className="mini-track"><span style={{ width: `${(progress / totalChallenges) * 100}%` }} /></div><button className="avatar" aria-label="Open profile menu" onClick={() => setProfileOpen((open) => !open)}>HN</button>{profileOpen && <div className="profile-menu"><strong>Student profile</strong><span>{progress} challenges complete</span><button onClick={() => { setCompleted([]); setProfileOpen(false); }}>Reset progress</button></div>}</div>
        <button className="mobile-menu" aria-label={mobileOpen ? "Close challenges" : "Open challenges"} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>
      <div className="workspace">
        <aside className={`sidebar ${mobileOpen ? "open" : ""}`} aria-label="Challenge navigation" id="progress">
            <div className="sidebar-heading"><div><p className="eyebrow">Your path</p><h2>Challenges</h2></div><span className="challenge-count">{progress}/{totalChallenges}</span></div>
          <div className="challenge-list">{challenges.map((item, index) => { const isComplete = completed.includes(item.id); const isCurrent = selectedId === item.id; return <button className={`challenge-item ${isCurrent ? "current" : ""}`} key={item.id} onClick={() => selectChallenge(item.id)}><span className={`status-icon ${isComplete ? "done" : ""}`}>{isComplete ? <Check size={14} /> : isCurrent ? <ChevronRight size={15} /> : <Circle size={12} />}</span><span className="challenge-copy"><strong>{String(index + 1).padStart(2, "0")} · {item.title}</strong><small>{item.difficulty}</small></span>{isComplete && <CheckCircle2 className="completion" size={16} />}</button>; })}</div>
          <div className="sidebar-note"><Sparkles size={17} /><div><strong>Keep going</strong><p>Small wins compound into real skill.</p></div></div>
        </aside>
        <main className="main-content" id="practice">
          {activeSection === "progress" && <section className="section-panel" aria-labelledby="progress-heading"><div><p className="eyebrow">Your progress</p><h2 id="progress-heading">Keep building momentum</h2><p>{progress} of {totalChallenges} challenges complete. Your solutions are saved automatically on this device.</p></div><div className="section-progress"><strong>{Math.round((progress / totalChallenges) * 100)}%</strong><div className="progress-track"><span style={{ width: `${(progress / totalChallenges) * 100}%` }} /></div></div></section>}
          {activeSection === "settings" && <section className="section-panel" aria-labelledby="settings-heading"><div><p className="eyebrow">Workspace settings</p><h2 id="settings-heading">Make practice feel like yours</h2><p>Choose the language used by the editor, tutor, and challenge checks.</p></div><label className="settings-language" htmlFor="settings-language">Preferred language<select id="settings-language" value={language} onChange={(event) => changeLanguage(event.target.value as ProgrammingLanguage)}>{languages.map((item) => <option key={item}>{item}</option>)}</select></label></section>}
          <div className="content-intro"><div><p className="eyebrow warm">Practice lab <span>·</span> {challenge.concept}</p><h1>{challenge.title}</h1><p className="description">{challenge.description}</p></div><span className={`difficulty ${challenge.difficulty === "Easy / Medium" ? "medium" : ""}`}><Zap size={14} /> {challenge.difficulty}</span></div>
          <div className="example-strip"><Info size={16} /><span><strong>Example</strong>{challenge.example}</span></div>
          <section className="editor-panel" aria-labelledby="editor-heading"><div className="panel-toolbar"><div className="file-tab"><span className="file-dot" /> solution.{language === "Python" ? "py" : language === "Java" ? "java" : language === "C++" ? "cpp" : language === "Go" ? "go" : language === "TypeScript" ? "ts" : "js"}</div><label className="language-select-label" htmlFor="language-select">Language</label><select id="language-select" className="language-select" value={language} onChange={(event) => changeLanguage(event.target.value as ProgrammingLanguage)}>{languages.map((item) => <option key={item}>{item}</option>)}</select></div><label id="editor-heading" className="sr-only" htmlFor="code-editor">Your solution code in {language}</label><textarea id="code-editor" className="code-editor" value={code} onChange={(event) => updateCode(event.target.value)} spellCheck={false} aria-describedby="editor-help" /><div className="editor-footer"><span id="editor-help"><Terminal size={14} /> {language} · controlled challenge evaluator</span><span>{code.split("\n").length} lines</span></div></section>
          {message && <div className="inline-message" role="alert"><AlertCircle size={17} /> {message}</div>}
          <div className="action-row"><button className="run-button" onClick={runCode} disabled={loading !== null}><Play size={17} fill="currentColor" /> {loading === "run" ? "Running..." : "Run tests"}</button><button className="secondary-button" onClick={getHint} disabled={loading !== null || hintLevel >= 3}><Lightbulb size={17} /> {loading === "hint" ? "Thinking..." : `Get hint ${hintLevel}/3`}</button><button className="secondary-button" onClick={explainCode} disabled={loading !== null}><BookOpen size={17} /> {loading === "explain" ? "Analyzing..." : "Explain code"}</button><button className="reset-button" onClick={() => updateCode(languageStarters[language][selectedId] ?? challenge.starter)} aria-label="Reset code" title="Reset code"><RotateCcw size={17} /></button></div>
          <div className="feedback-grid">
            <section className={`feedback-panel ${results ? "has-content" : ""}`} aria-live="polite"><div className="feedback-heading"><div><p className="eyebrow">Verification</p><h2>Test results</h2></div>{results && <span className={results.every((item) => item.passed) ? "result-pill success" : "result-pill"}>{results.every((item) => item.passed) ? "All passed" : "Keep iterating"}</span>}</div>{results ? <div className="results-list">{results.map((result) => <div className="result-row" key={result.label}><span className={result.passed ? "result-icon passed" : "result-icon failed"}>{result.passed ? <Check size={14} /> : <X size={14} />}</span><span><strong>{result.label} {result.passed ? "passed" : "needs work"}</strong><small>Expected: {result.expected} · {result.received}</small></span></div>)}</div> : <div className="empty-feedback"><Terminal size={24} /><p>Run your solution to see how it holds up.</p><span>Tests are designed to give you a clear next step.</span></div>}</section>
            <section className={`feedback-panel ai-panel ${hint || explanation ? "has-content" : ""}`} aria-live="polite"><div className="feedback-heading"><div><p className="eyebrow">Tutor notes</p><h2>AI feedback</h2></div><Sparkles size={18} className="sparkle" /></div>{hint ? <div className="hint-content"><span className="hint-label">HINT {hintLevel} <span className="hint-dots">{[1, 2, 3].map((level) => <i className={level <= hintLevel ? "filled" : ""} key={level} />)}</span></span><p>{hint}</p><small>Hints get more specific as you work. You are still driving.</small></div> : explanation ? <div className="explanation"><strong>What your code does</strong><p>{explanation.summary}</p><strong>Step by step</strong><ul>{explanation.steps.map((step) => <li key={step}>{step}</li>)}</ul><strong>Potential issue</strong><p>{explanation.issues[0] ?? "No obvious issues were identified."}</p><strong>Learning takeaway</strong><p>{explanation.learningTakeaway}</p></div> : <div className="empty-feedback"><Lightbulb size={24} /><p>Your tutor is ready when you are.</p><span>Ask for a hint when you feel stuck, or request an explanation after you try.</span></div>}</section>
          </div>
          <div className="footer-tip"><CheckCircle2 size={16} /> Passing all tests marks this challenge complete <span>·</span> Progress saves automatically</div>
        </main>
      </div>
    </div>
  );
}

export default App;