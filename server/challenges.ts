export type ChallengeDefinition = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  example: string;
};

export const challenges: ChallengeDefinition[] = [
  { id: "hello-world", title: "Hello World", difficulty: "Easy", description: "Write a program that prints the exact message Hello, World! to the console.", example: 'Output: "Hello, World!"' },
  { id: "variables", title: "Variables", difficulty: "Easy", description: "Create variables for a person's name and age, then display them in a readable sentence.", example: 'name = "Ada", age = 28 -> "Ada is 28 years old."' },
  { id: "two-sum", title: "Two Sum", difficulty: "Easy / Medium", description: "Given an array of integers and a target, return the indices of two numbers that add up to the target.", example: "[2, 7, 11, 15], target 9 -> [0, 1]" },
  { id: "palindrome", title: "Palindrome", difficulty: "Easy", description: "Determine whether a given string reads the same forwards and backwards.", example: '"madam" -> true; "hello" -> false' },
  { id: "fizzbuzz", title: "FizzBuzz", difficulty: "Easy", description: "For numbers 1 through 100, print Fizz, Buzz, FizzBuzz, or the number based on its divisibility.", example: "3 -> Fizz; 5 -> Buzz; 15 -> FizzBuzz" },
  { id: "reverse-string", title: "Reverse a String", difficulty: "Easy", description: "Return a new string with the characters of the input arranged in reverse order.", example: '"code" -> "edoc"' },
  { id: "factorial", title: "Factorial", difficulty: "Easy", description: "Calculate the factorial of a non-negative integer by multiplying all integers from 1 through that number.", example: "5 -> 120" },
  { id: "count-vowels", title: "Count Vowels", difficulty: "Easy", description: "Count how many vowels appear in a string. Treat a, e, i, o, and u as vowels.", example: '"education" -> 5' },
];

export function findChallenge(challengeId: string): ChallengeDefinition | undefined {
  return challenges.find((challenge) => challenge.id === challengeId);
}
