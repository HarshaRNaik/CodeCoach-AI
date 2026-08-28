export type ChallengeDefinition = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  example: string;
};

export const challenges: ChallengeDefinition[] = [
  {
    id: "hello-world",
    title: "Hello World",
    difficulty: "Easy",
    description:
      "Write a program that prints the exact message Hello, World! to the console.",
    example: 'Output: "Hello, World!"',
  },
  {
    id: "variables",
    title: "Variables",
    difficulty: "Easy",
    description:
      "Create variables for a person's name and age, then display them in a readable sentence.",
    example: 'name = "Ada", age = 28 -> "Ada is 28 years old."',
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy / Medium",
    description:
      "Given an array of integers and a target, return the indices of two numbers that add up to the target.",
    example: "[2, 7, 11, 15], target 9 -> [0, 1]",
  },
  {
    id: "palindrome",
    title: "Palindrome",
    difficulty: "Easy",
    description:
      "Determine whether a given string reads the same forwards and backwards.",
    example: '"madam" -> true; "hello" -> false',
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "Easy",
    description:
      "For numbers 1 through 100, print Fizz, Buzz, FizzBuzz, or the number based on its divisibility.",
    example: "3 -> Fizz; 5 -> Buzz; 15 -> FizzBuzz",
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    description:
      "Return a new string with the characters of the input arranged in reverse order.",
    example: '"code" -> "edoc"',
  },
  {
    id: "factorial",
    title: "Factorial",
    difficulty: "Easy",
    description:
      "Calculate the factorial of a non-negative integer by multiplying all integers from 1 through that number.",
    example: "5 -> 120",
  },
  {
    id: "count-vowels",
    title: "Count Vowels",
    difficulty: "Easy",
    description:
      "Count how many vowels appear in a string. Treat a, e, i, o, and u as vowels.",
    example: '"education" -> 5',
  },

  {
    id: "data-types",
    title: "Data Types",
    difficulty: "Easy",
    description:
      "Create variables representing a person's name, age, and whether they are a student. Use appropriate data types for each value.",
    example: 'name = "Ada", age = 28, student = true',
  },
  {
    id: "swap-variables",
    title: "Swap Variables",
    difficulty: "Easy",
    description:
      "Swap the values of two variables so that each variable contains the value previously stored in the other variable.",
    example: "a = 10, b = 20 -> a = 20, b = 10",
  },
  {
    id: "character-frequency",
    title: "Character Frequency",
    difficulty: "Easy",
    description:
      "Count how many times each character appears in a given string.",
    example: '"hello" -> h:1, e:1, l:2, o:1',
  },
  {
    id: "find-maximum",
    title: "Find Maximum",
    difficulty: "Easy",
    description:
      "Find and return the largest number in an array of integers.",
    example: "[3, 7, 2, 9, 4] -> 9",
  },
  {
    id: "remove-duplicates",
    title: "Remove Duplicates",
    difficulty: "Easy / Medium",
    description:
      "Return an array containing the unique values from the input array while preserving their original order.",
    example: "[1, 2, 2, 3, 1] -> [1, 2, 3]",
  },
  {
    id: "fibonacci",
    title: "Fibonacci",
    difficulty: "Easy",
    description:
      "Return the nth Fibonacci number, where the sequence starts with 0 and 1.",
    example: "fib(6) -> 8",
  },
  {
    id: "prime-number",
    title: "Prime Number",
    difficulty: "Easy",
    description:
      "Determine whether a given integer is a prime number.",
    example: "7 -> true; 10 -> false",
  },
  {
    id: "linear-search",
    title: "Linear Search",
    difficulty: "Easy",
    description:
      "Search an array for a target value and return its index. Return -1 if the target is not present.",
    example: "[4, 8, 15, 16], target 15 -> 2",
  },
];

export function findChallenge(
  challengeId: string
): ChallengeDefinition | undefined {
  return challenges.find((challenge) => challenge.id === challengeId);
}