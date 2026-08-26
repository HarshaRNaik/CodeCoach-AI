import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
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
  Settings as SettingsIcon,
  Sparkles,
  Terminal,
  User,
  X,
  Zap,
} from "lucide-react";
import "./App.css";
import {
  requestExplanation,
  requestHint,
  requestRun,
  type ExplanationResponse,
  type ProgrammingLanguage,
} from "./lib/api";
import { type TestResult } from "../shared/evaluator";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

type Challenge = {
  id: string;
  title: string;
  difficulty: "Easy" | "Easy / Medium";
  description: string;
  example: string;
  starter: string;
  concept: string;
};

type Section = "practice" | "progress" | "settings" | "profile";

export type Theme = "light" | "dark";

const languages: ProgrammingLanguage[] = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
  "C#",
  "Ruby",
  "PHP",
  "Kotlin",
  "Rust",
  "Swift",
  "C",
  "Dart",
  "Scala",
  "R",
  "Bash",
];

const languageExtensions: Record<ProgrammingLanguage, string> = {
  JavaScript: "js",
  TypeScript: "ts",
  Python: "py",
  Java: "java",
  "C++": "cpp",
  Go: "go",
  "C#": "cs",
  Ruby: "rb",
  PHP: "php",
  Kotlin: "kt",
  Rust: "rs",
  Swift: "swift",
  C: "c",
  Dart: "dart",
  Scala: "scala",
  R: "r",
  Bash: "sh",
};

const languageStarters: Record<
  ProgrammingLanguage,
  Record<string, string>
> = {
  JavaScript: {
    "hello-world": `// Print the message below
console.log("Hello, World!");`,
    variables: `const name = "Ada";
const age = 28;

// Display a sentence using both variables`,
    "two-sum": `function twoSum(numbers, target) {
  // Return the indices of the two matching numbers
}

console.log(twoSum([2, 7, 11, 15], 9));`,
    palindrome: `function isPalindrome(word) {
  // Return true when word reads the same backwards
}

console.log(isPalindrome("madam"));`,
    fizzbuzz: `for (let number = 1; number <= 100; number++) {
  // Check divisibility before printing the number
}`,
    "reverse-string": `function reverseString(word) {
  // Return word with its characters reversed
}`,
    factorial: `function factorial(number) {
  // Return the product of every integer from 1 to number
}`,
    "count-vowels": `function countVowels(word) {
  // Return how many vowels appear in word
}`,
    "data-types": `const name = "Alice";
const age = 30;
const isStudent = false;

// Log all three variables`,
    "swap-variables": `let a = 10;
let b = 20;

// Swap the values of a and b`,
    "character-frequency": `function characterFrequency(word) {
  // Return an object/map with character counts
}`,
    "find-maximum": `function findMaximum(numbers) {
  // Return the largest number
}`,
    "remove-duplicates": `function removeDuplicates(array) {
  // Return unique values in original order
}`,
    "fibonacci": `function fibonacci(n) {
  // Return the nth Fibonacci number
}`,
    "prime-number": `function isPrime(number) {
  // Return true if number is prime
}`,
    "linear-search": `function linearSearch(array, target) {
  // Return the index of target or -1
}`,
  },

  Python: {
    "hello-world": `# Print the message below
print("Hello, World!")`,
    variables: `name = "Ada"
age = 28

# Display a sentence using both variables`,
    "two-sum": `def two_sum(numbers, target):
    # Return the indices of the two matching numbers
    pass

print(two_sum([2, 7, 11, 15], 9))`,
    palindrome: `def is_palindrome(word):
    # Return True when word reads the same backwards
    pass

print(is_palindrome("madam"))`,
    fizzbuzz: `for number in range(1, 101):
    # Check divisibility before printing the number
    pass`,
    "reverse-string": `def reverse_string(word):
    # Return word with its characters reversed
    pass`,
    factorial: `def factorial(number):
    # Return the product of every integer from 1 to number
    pass`,
    "count-vowels": `def count_vowels(word):
    # Return how many vowels appear in word
    pass`,
    "data-types": `name = "Alice"
age = 30
is_student = False

# Print all three variables`,
    "swap-variables": `a = 10
b = 20

# Swap the values of a and b`,
    "character-frequency": `def character_frequency(word):
    # Return a dictionary with character counts
    pass`,
    "find-maximum": `def find_maximum(numbers):
    # Return the largest number
    pass`,
    "remove-duplicates": `def remove_duplicates(array):
    # Return unique values in original order
    pass`,
    "fibonacci": `def fibonacci(n):
    # Return the nth Fibonacci number
    pass`,
    "prime-number": `def is_prime(number):
    # Return True if number is prime
    pass`,
    "linear-search": `def linear_search(array, target):
    # Return the index of target or -1
    pass`,
  },

  TypeScript: {
    "hello-world": `// Print the message below
console.log("Hello, World!");`,
    variables: `const name: string = "Ada";
const age: number = 28;

// Display a sentence using both variables`,
    "two-sum": `function twoSum(numbers: number[], target: number): number[] {
  // Return the indices of the two matching numbers
  return [];
}`,
    palindrome: `function isPalindrome(word: string): boolean {
  // Return true when word reads the same backwards
  return false;
}`,
    fizzbuzz: `for (let number = 1; number <= 100; number++) {
  // Check divisibility before printing the number
}`,
    "reverse-string": `function reverseString(word: string): string {
  // Return word with its characters reversed
  return "";
}`,
    factorial: `function factorial(number: number): number {
  // Return the product of every integer from 1 to number
  return 0;
}`,
    "count-vowels": `function countVowels(word: string): number {
  // Return how many vowels appear in word
  return 0;
}`,
    "data-types": `const name: string = "Alice";
const age: number = 30;
const isStudent: boolean = false;

// Log all three variables`,
    "swap-variables": `let a: number = 10;
let b: number = 20;

// Swap the values of a and b`,
    "character-frequency": `function characterFrequency(word: string): Record<string, number> {
  // Return a map with character counts
  return {};
}`,
    "find-maximum": `function findMaximum(numbers: number[]): number {
  // Return the largest number
  return 0;
}`,
    "remove-duplicates": `function removeDuplicates(array: number[]): number[] {
  // Return unique values in original order
  return [];
}`,
    "fibonacci": `function fibonacci(n: number): number {
  // Return the nth Fibonacci number
  return 0;
}`,
    "prime-number": `function isPrime(number: number): boolean {
  // Return true if number is prime
  return false;
}`,
    "linear-search": `function linearSearch(array: number[], target: number): number {
  // Return the index of target or -1
  return -1;
}`,
  },

  Java: {
    "hello-world": `class Main {
  public static void main(String[] args) {
    // Print the message below
  }
}`,
    variables: `class Main {
  public static void main(String[] args) {
    String name = "Ada";
    int age = 28;
    // Display a sentence using both variables
  }
}`,
    "two-sum": `class Main {
  static int[] twoSum(int[] numbers, int target) {
    // Return the indices of the two matching numbers
    return new int[]{};
  }
}`,
    palindrome: `class Main {
  static boolean isPalindrome(String word) {
    // Return true when word reads the same backwards
    return false;
  }
}`,
    fizzbuzz: `class Main {
  public static void main(String[] args) {
    // Check divisibility before printing each number
  }
}`,
    "reverse-string": `class Main {
  static String reverseString(String word) {
    // Return word with its characters reversed
    return "";
  }
}`,
    factorial: `class Main {
  static int factorial(int number) {
    // Return the product of every integer from 1 to number
    return 0;
  }
}`,
    "count-vowels": `class Main {
  static int countVowels(String word) {
    // Return how many vowels appear in word
    return 0;
  }
}`,
    "data-types": `class Main {
  public static void main(String[] args) {
    String name = "Alice";
    int age = 30;
    boolean isStudent = false;
    // Log all three variables
  }
}`,
    "swap-variables": `class Main {
  public static void main(String[] args) {
    int a = 10;
    int b = 20;
    // Swap the values of a and b
  }
}`,
    "character-frequency": `import java.util.Map;

class Main {
  static Map<Character, Integer> characterFrequency(String word) {
    // Return a map with character counts
    return new HashMap<>();
  }
}`,
    "find-maximum": `class Main {
  static int findMaximum(int[] numbers) {
    // Return the largest number
    return 0;
  }
}`,
    "remove-duplicates": `import java.util.List;

class Main {
  static List<Integer> removeDuplicates(int[] array) {
    // Return unique values in original order
    return new ArrayList<>();
  }
}`,
    "fibonacci": `class Main {
  static int fibonacci(int n) {
    // Return the nth Fibonacci number
    return 0;
  }
}`,
    "prime-number": `class Main {
  static boolean isPrime(int number) {
    // Return true if number is prime
    return false;
  }
}`,
    "linear-search": `class Main {
  static int linearSearch(int[] array, int target) {
    // Return the index of target or -1
    return -1;
  }
}`,
  },

  "C++": {
    "hello-world": `#include <iostream>

int main() {
  // Print the message below
}`,
    variables: `#include <iostream>
#include <string>

int main() {
  std::string name = "Ada";
  int age = 28;

  // Display a sentence using both variables
}`,
    "two-sum": `#include <vector>

std::vector<int> twoSum(std::vector<int> numbers, int target) {
  // Return the indices of the two matching numbers
  return {};
}`,
    palindrome: `#include <string>

bool isPalindrome(std::string word) {
  // Return true when word reads the same backwards
  return false;
}`,
    fizzbuzz: `#include <iostream>

int main() {
  // Check divisibility before printing each number
}`,
    "reverse-string": `#include <string>

std::string reverseString(std::string word) {
  // Return word with its characters reversed
  return "";
}`,
    factorial: `int factorial(int number) {
  // Return the product of every integer from 1 to number
  return 0;
}`,
    "count-vowels": `#include <string>

int countVowels(std::string word) {
  // Return how many vowels appear in word
  return 0;
}`,
    "data-types": `#include <iostream>
#include <string>

int main() {
  std::string name = "Alice";
  int age = 30;
  bool isStudent = false;
  // Print all three variables
}`,
    "swap-variables": `#include <iostream>

int main() {
  int a = 10;
  int b = 20;
  // Swap the values of a and b
}`,
    "character-frequency": `#include <string>
#include <map>

std::map<char, int> characterFrequency(std::string word) {
  // Return a map with character counts
  return {};
}`,
    "find-maximum": `#include <vector>

int findMaximum(std::vector<int> numbers) {
  // Return the largest number
  return 0;
}`,
    "remove-duplicates": `#include <vector>

std::vector<int> removeDuplicates(std::vector<int> array) {
  // Return unique values in original order
  return {};
}`,
    "fibonacci": `int fibonacci(int n) {
  // Return the nth Fibonacci number
  return 0;
}`,
    "prime-number": `bool isPrime(int number) {
  // Return true if number is prime
  return false;
}`,
    "linear-search": `#include <vector>

int linearSearch(std::vector<int> array, int target) {
  // Return the index of target or -1
  return -1;
}`,
  },

  Go: {
    "hello-world": `package main

import "fmt"

func main() {
  // Print the message below
}`,
    variables: `package main

import "fmt"

func main() {
  name := "Ada"
  age := 28

  // Display a sentence using both variables
  _ = fmt.Sprintf
}`,
    "two-sum": `func twoSum(numbers []int, target int) []int {
  // Return the indices of the two matching numbers
  return []int{}
}`,
    palindrome: `func isPalindrome(word string) bool {
  // Return true when word reads the same backwards
  return false
}`,
    fizzbuzz: `package main

func main() {
  // Check divisibility before printing each number
}`,
    "reverse-string": `func reverseString(word string) string {
  // Return word with its characters reversed
  return ""
}`,
    factorial: `func factorial(number int) int {
  // Return the product of every integer from 1 to number
  return 0
}`,
    "count-vowels": `func countVowels(word string) int {
  // Return how many vowels appear in word
  return 0
}`,
    "data-types": `package main

import "fmt"

func main() {
  name := "Alice"
  age := 30
  isStudent := false
  // Print all three variables
  _ = fmt.Sprintf
}`,
    "swap-variables": `package main

func main() {
  a := 10
  b := 20
  // Swap the values of a and b
}`,
    "character-frequency": `func characterFrequency(word string) map[rune]int {
  // Return a map with character counts
  return make(map[rune]int)
}`,
    "find-maximum": `func findMaximum(numbers []int) int {
  // Return the largest number
  return 0
}`,
    "remove-duplicates": `func removeDuplicates(array []int) []int {
  // Return unique values in original order
  return []int{}
}`,
    "fibonacci": `func fibonacci(n int) int {
  // Return the nth Fibonacci number
  return 0
}`,
    "prime-number": `func isPrime(number int) bool {
  // Return true if number is prime
  return false
}`,
    "linear-search": `func linearSearch(array []int, target int) int {
  // Return the index of target or -1
  return -1
}`,
  },

  "C#": {
    "hello-world": `using System;

class Program {
  static void Main() {
    // Print the message below
  }
}`,
    variables: `using System;

class Program {
  static void Main() {
    string name = "Ada";
    int age = 28;
    // Display a sentence using both variables
  }
}`,
    "two-sum": `static int[] TwoSum(int[] numbers, int target) {
  // Return the indices of the two matching numbers
  return new int[]{};
}`,
    palindrome: `static bool IsPalindrome(string word) {
  // Return true when word reads the same backwards
  return false;
}`,
    fizzbuzz: `for (int number = 1; number <= 100; number++) {
  // Check divisibility before printing the number
}`,
    "reverse-string": `static string ReverseString(string word) {
  // Return word with its characters reversed
  return "";
}`,
    factorial: `static int Factorial(int number) {
  // Return the product of every integer from 1 to number
  return 0;
}`,
    "count-vowels": `static int CountVowels(string word) {
  // Return how many vowels appear in word
  return 0;
}`,
    "data-types": `using System;

class Program {
  static void Main() {
    string name = "Alice";
    int age = 30;
    bool isStudent = false;
    // Print all three variables
  }
}`,
    "swap-variables": `int a = 10;
int b = 20;
// Swap the values of a and b`,
    "character-frequency": `static Dictionary<char, int> CharacterFrequency(string word) {
  // Return a dictionary with character counts
  return new Dictionary<char, int>();
}`,
    "find-maximum": `static int FindMaximum(int[] numbers) {
  // Return the largest number
  return 0;
}`,
    "remove-duplicates": `static List<int> RemoveDuplicates(int[] array) {
  // Return unique values in original order
  return new List<int>();
}`,
    "fibonacci": `static int Fibonacci(int n) {
  // Return the nth Fibonacci number
  return 0;
}`,
    "prime-number": `static bool IsPrime(int number) {
  // Return true if number is prime
  return false;
}`,
    "linear-search": `static int LinearSearch(int[] array, int target) {
  // Return the index of target or -1
  return -1;
}`,
  },

  Ruby: {
    "hello-world": `# Print the message below
puts "Hello, World!"`,
    variables: `name = "Ada"
age = 28

# Display a sentence using both variables`,
    "two-sum": `def two_sum(numbers, target)
  # Return the indices of the two matching numbers
end`,
    palindrome: `def is_palindrome(word)
  # Return true when word reads the same backwards
  false
end`,
    fizzbuzz: `(1..100).each do |number|
  # Check divisibility before printing the number
end`,
    "reverse-string": `def reverse_string(word)
  # Return word with its characters reversed
  ""
end`,
    factorial: `def factorial(number)
  # Return the product of every integer from 1 to number
  0
end`,
    "count-vowels": `def count_vowels(word)
  # Return how many vowels appear in word
  0
end`,
    "data-types": `name = "Alice"
age = 30
is_student = false

# Print all three variables`,
    "swap-variables": `a = 10
b = 20

# Swap the values of a and b`,
    "character-frequency": `def character_frequency(word)
  # Return a hash with character counts
  {}
end`,
    "find-maximum": `def find_maximum(numbers)
  # Return the largest number
  0
end`,
    "remove-duplicates": `def remove_duplicates(array)
  # Return unique values in original order
  []
end`,
    "fibonacci": `def fibonacci(n)
  # Return the nth Fibonacci number
  0
end`,
    "prime-number": `def is_prime(number)
  # Return true if number is prime
  false
end`,
    "linear-search": `def linear_search(array, target)
  # Return the index of target or -1
  -1
end`,
  },

  PHP: {
    "hello-world": `<?php
// Print the message below
echo "Hello, World!";
?>`,
    variables: `<?php
$name = "Ada";
$age = 28;

// Display a sentence using both variables
?>`,
    "two-sum": `<?php
function twoSum($numbers, $target) {
  // Return the indices of the two matching numbers
  return [];
}
?>`,
    palindrome: `<?php
function isPalindrome($word) {
  // Return true when word reads the same backwards
  return false;
}
?>`,
    fizzbuzz: `<?php
for ($number = 1; $number <= 100; $number++) {
  // Check divisibility before printing the number
}
?>`,
    "reverse-string": `<?php
function reverseString($word) {
  // Return word with its characters reversed
  return "";
}
?>`,
    factorial: `<?php
function factorial($number) {
  // Return the product of every integer from 1 to number
  return 0;
}
?>`,
    "count-vowels": `<?php
function countVowels($word) {
  // Return how many vowels appear in word
  return 0;
}
?>`,
    "data-types": `<?php
$name = "Alice";
$age = 30;
$is_student = false;

// Print all three variables
?>`,
    "swap-variables": `<?php
$a = 10;
$b = 20;

// Swap the values of a and b
?>`,
    "character-frequency": `<?php
function characterFrequency($word) {
  // Return an array with character counts
  return [];
}
?>`,
    "find-maximum": `<?php
function findMaximum($numbers) {
  // Return the largest number
  return 0;
}
?>`,
    "remove-duplicates": `<?php
function removeDuplicates($array) {
  // Return unique values in original order
  return [];
}
?>`,
    "fibonacci": `<?php
function fibonacci($n) {
  // Return the nth Fibonacci number
  return 0;
}
?>`,
    "prime-number": `<?php
function isPrime($number) {
  // Return true if number is prime
  return false;
}
?>`,
    "linear-search": `<?php
function linearSearch($array, $target) {
  // Return the index of target or -1
  return -1;
}
?>`,
  },

  Kotlin: {
    "hello-world": `fun main() {
  // Print the message below
}`,
    variables: `fun main() {
  val name = "Ada"
  val age = 28
  // Display a sentence using both variables
}`,
    "two-sum": `fun twoSum(numbers: IntArray, target: Int): IntArray {
  // Return the indices of the two matching numbers
  return intArrayOf()
}`,
    palindrome: `fun isPalindrome(word: String): Boolean {
  // Return true when word reads the same backwards
  return false
}`,
    fizzbuzz: `fun main() {
  for (number in 1..100) {
    // Check divisibility before printing the number
  }
}`,
    "reverse-string": `fun reverseString(word: String): String {
  // Return word with its characters reversed
  return ""
}`,
    factorial: `fun factorial(number: Int): Int {
  // Return the product of every integer from 1 to number
  return 0
}`,
    "count-vowels": `fun countVowels(word: String): Int {
  // Return how many vowels appear in word
  return 0
}`,
    "data-types": `fun main() {
  val name = "Alice"
  val age = 30
  val isStudent = false
  // Print all three variables
}`,
    "swap-variables": `fun main() {
  var a = 10
  var b = 20
  // Swap the values of a and b
}`,
    "character-frequency": `fun characterFrequency(word: String): Map<Char, Int> {
  // Return a map with character counts
  return mapOf()
}`,
    "find-maximum": `fun findMaximum(numbers: IntArray): Int {
  // Return the largest number
  return 0
}`,
    "remove-duplicates": `fun removeDuplicates(array: IntArray): List<Int> {
  // Return unique values in original order
  return listOf()
}`,
    "fibonacci": `fun fibonacci(n: Int): Int {
  // Return the nth Fibonacci number
  return 0
}`,
    "prime-number": `fun isPrime(number: Int): Boolean {
  // Return true if number is prime
  return false
}`,
    "linear-search": `fun linearSearch(array: IntArray, target: Int): Int {
  // Return the index of target or -1
  return -1
}`,
  },

  Rust: {
    "hello-world": `fn main() {
  // Print the message below
}`,
    variables: `fn main() {
  let name = "Ada";
  let age = 28;
  // Display a sentence using both variables
}`,
    "two-sum": `fn two_sum(numbers: &[i32], target: i32) -> Vec<usize> {
  // Return the indices of the two matching numbers
  vec![]
}`,
    palindrome: `fn is_palindrome(word: &str) -> bool {
  // Return true when word reads the same backwards
  false
}`,
    fizzbuzz: `fn main() {
  for number in 1..=100 {
    // Check divisibility before printing the number
  }
}`,
    "reverse-string": `fn reverse_string(word: &str) -> String {
  // Return word with its characters reversed
  String::new()
}`,
    factorial: `fn factorial(number: i32) -> i32 {
  // Return the product of every integer from 1 to number
  0
}`,
    "count-vowels": `fn count_vowels(word: &str) -> i32 {
  // Return how many vowels appear in word
  0
}`,
    "data-types": `fn main() {
  let name = "Alice";
  let age = 30;
  let is_student = false;
  // Print all three variables
}`,
    "swap-variables": `fn main() {
  let mut a = 10;
  let mut b = 20;
  // Swap the values of a and b
}`,
    "character-frequency": `use std::collections::HashMap;

fn character_frequency(word: &str) -> HashMap<char, i32> {
  // Return a map with character counts
  HashMap::new()
}`,
    "find-maximum": `fn find_maximum(numbers: &[i32]) -> i32 {
  // Return the largest number
  0
}`,
    "remove-duplicates": `fn remove_duplicates(array: &[i32]) -> Vec<i32> {
  // Return unique values in original order
  vec![]
}`,
    "fibonacci": `fn fibonacci(n: i32) -> i32 {
  // Return the nth Fibonacci number
  0
}`,
    "prime-number": `fn is_prime(number: i32) -> bool {
  // Return true if number is prime
  false
}`,
    "linear-search": `fn linear_search(array: &[i32], target: i32) -> i32 {
  // Return the index of target or -1
  -1
}`,
  },

  Swift: {
    "hello-world": `import Foundation

// Print the message below
print("Hello, World!")`,
    variables: `var name = "Ada"
var age = 28

// Display a sentence using both variables`,
    "two-sum": `func twoSum(_ numbers: [Int], _ target: Int) -> [Int] {
  // Return the indices of the two matching numbers
  return []
}`,
    palindrome: `func isPalindrome(_ word: String) -> Bool {
  // Return true when word reads the same backwards
  return false
}`,
    fizzbuzz: `for number in 1...100 {
  // Check divisibility before printing the number
}`,
    "reverse-string": `func reverseString(_ word: String) -> String {
  // Return word with its characters reversed
  return ""
}`,
    factorial: `func factorial(_ number: Int) -> Int {
  // Return the product of every integer from 1 to number
  return 0
}`,
    "count-vowels": `func countVowels(_ word: String) -> Int {
  // Return how many vowels appear in word
  return 0
}`,
    "data-types": `var name = "Alice"
var age = 30
var isStudent = false

// Print all three variables`,
    "swap-variables": `var a = 10
var b = 20

// Swap the values of a and b`,
    "character-frequency": `func characterFrequency(_ word: String) -> [Character: Int] {
  // Return a dictionary with character counts
  return [:]
}`,
    "find-maximum": `func findMaximum(_ numbers: [Int]) -> Int {
  // Return the largest number
  return 0
}`,
    "remove-duplicates": `func removeDuplicates(_ array: [Int]) -> [Int] {
  // Return unique values in original order
  return []
}`,
    "fibonacci": `func fibonacci(_ n: Int) -> Int {
  // Return the nth Fibonacci number
  return 0
}`,
    "prime-number": `func isPrime(_ number: Int) -> Bool {
  // Return true if number is prime
  return false
}`,
    "linear-search": `func linearSearch(_ array: [Int], _ target: Int) -> Int {
  // Return the index of target or -1
  return -1
}`,
  },

  C: {
    "hello-world": `#include <stdio.h>

int main(void) {
  // Print the message below
  printf("Hello, World!\\n");
  return 0;
}`,
    variables: `#include <stdio.h>

int main(void) {
  const char *name = "Ada";
  int age = 28;

  // Display a sentence using both variables
  return 0;
}`,
    "two-sum": `void two_sum(int numbers[], int length, int target, int result[]) {
  // Return the indices of the two matching numbers
}`,
    palindrome: `int is_palindrome(const char *word) {
  // Return 1 when word reads the same backwards
  return 0;
}`,
    fizzbuzz: `for (int number = 1; number <= 100; number++) {
  // Check divisibility before printing the number
}`,
    "reverse-string": `void reverse_string(char word[]) {
  // Reverse the characters in word
}`,
    factorial: `int factorial(int number) {
  // Return the product of every integer from 1 to number
  return 0;
}`,
    "count-vowels": `int count_vowels(const char *word) {
  // Return how many vowels appear in word
  return 0;
}`,
    "data-types": `const char *name = "Alice";
int age = 30;
int is_student = 0;

// Print all three variables`,
    "swap-variables": `int a = 10;
int b = 20;

// Swap the values of a and b`,
    "character-frequency": `void character_frequency(const char *word, int counts[256]) {
  // Fill counts with character frequencies
}`,
    "find-maximum": `int find_maximum(int numbers[], int length) {
  // Return the largest number
  return 0;
}`,
    "remove-duplicates": `int remove_duplicates(int array[], int length, int result[]) {
  // Return unique values in original order
  return 0;
}`,
    "fibonacci": `int fibonacci(int n) {
  // Return the nth Fibonacci number
  return 0;
}`,
    "prime-number": `int is_prime(int number) {
  // Return 1 if number is prime
  return 0;
}`,
    "linear-search": `int linear_search(int array[], int length, int target) {
  // Return the index of target or -1
  return -1;
}`,
  },

  Dart: {
    "hello-world": `void main() {
  // Print the message below
  print("Hello, World!");
}`,
    variables: `final name = "Ada";
final age = 28;

// Display a sentence using both variables`,
    "two-sum": `List<int> twoSum(List<int> numbers, int target) {
  // Return the indices of the two matching numbers
  return [];
}`,
    palindrome: `bool isPalindrome(String word) {
  // Return true when word reads the same backwards
  return false;
}`,
    fizzbuzz: `for (var number = 1; number <= 100; number++) {
  // Check divisibility before printing the number
}`,
    "reverse-string": `String reverseString(String word) {
  // Return word with its characters reversed
  return "";
}`,
    factorial: `int factorial(int number) {
  // Return the product of every integer from 1 to number
  return 0;
}`,
    "count-vowels": `int countVowels(String word) {
  // Return how many vowels appear in word
  return 0;
}`,
    "data-types": `final name = "Alice";
final age = 30;
final isStudent = false;

// Print all three variables`,
    "swap-variables": `var a = 10;
var b = 20;

// Swap the values of a and b`,
    "character-frequency": `Map<String, int> characterFrequency(String word) {
  // Return a map with character counts
  return {};
}`,
    "find-maximum": `int findMaximum(List<int> numbers) {
  // Return the largest number
  return 0;
}`,
    "remove-duplicates": `List<int> removeDuplicates(List<int> array) {
  // Return unique values in original order
  return [];
}`,
    "fibonacci": `int fibonacci(int n) {
  // Return the nth Fibonacci number
  return 0;
}`,
    "prime-number": `bool isPrime(int number) {
  // Return true if number is prime
  return false;
}`,
    "linear-search": `int linearSearch(List<int> array, int target) {
  // Return the index of target or -1
  return -1;
}`,
  },

  Scala: {
    "hello-world": `object Solution extends App {
  // Print the message below
  println("Hello, World!")
}`,
    variables: `val name = "Ada"
val age = 28

// Display a sentence using both variables`,
    "two-sum": `def twoSum(numbers: Array[Int], target: Int): Array[Int] = {
  // Return the indices of the two matching numbers
  Array()
}`,
    palindrome: `def isPalindrome(word: String): Boolean = {
  // Return true when word reads the same backwards
  false
}`,
    fizzbuzz: `for (number <- 1 to 100) {
  // Check divisibility before printing the number
}`,
    "reverse-string": `def reverseString(word: String): String = {
  // Return word with its characters reversed
  ""
}`,
    factorial: `def factorial(number: Int): Int = {
  // Return the product of every integer from 1 to number
  0
}`,
    "count-vowels": `def countVowels(word: String): Int = {
  // Return how many vowels appear in word
  0
}`,
    "data-types": `val name = "Alice"
val age = 30
val isStudent = false

// Print all three variables`,
    "swap-variables": `var a = 10
var b = 20

// Swap the values of a and b`,
    "character-frequency": `def characterFrequency(word: String): Map[Char, Int] = {
  // Return a map with character counts
  Map()
}`,
    "find-maximum": `def findMaximum(numbers: Array[Int]): Int = {
  // Return the largest number
  0
}`,
    "remove-duplicates": `def removeDuplicates(array: Array[Int]): Array[Int] = {
  // Return unique values in original order
  Array()
}`,
    "fibonacci": `def fibonacci(n: Int): Int = {
  // Return the nth Fibonacci number
  0
}`,
    "prime-number": `def isPrime(number: Int): Boolean = {
  // Return true if number is prime
  false
}`,
    "linear-search": `def linearSearch(array: Array[Int], target: Int): Int = {
  // Return the index of target or -1
  -1
}`,
  },

  R: {
    "hello-world": `# Print the message below
print("Hello, World!")`,
    variables: `name <- "Ada"
age <- 28

# Display a sentence using both variables`,
    "two-sum": `two_sum <- function(numbers, target) {
  # Return the indices of the two matching numbers
  c()
}`,
    palindrome: `is_palindrome <- function(word) {
  # Return TRUE when word reads the same backwards
  FALSE
}`,
    fizzbuzz: `for (number in 1:100) {
  # Check divisibility before printing the number
}`,
    "reverse-string": `reverse_string <- function(word) {
  # Return word with its characters reversed
  ""
}`,
    factorial: `factorial_number <- function(number) {
  # Return the product of every integer from 1 to number
  0
}`,
    "count-vowels": `count_vowels <- function(word) {
  # Return how many vowels appear in word
  0
}`,
    "data-types": `name <- "Alice"
age <- 30
is_student <- FALSE

# Print all three variables`,
    "swap-variables": `a <- 10
b <- 20

# Swap the values of a and b`,
    "character-frequency": `character_frequency <- function(word) {
  # Return a named vector/table with character counts
  table(strsplit(word, "")[[1]])
}`,
    "find-maximum": `find_maximum <- function(numbers) {
  # Return the largest number
  0
}`,
    "remove-duplicates": `remove_duplicates <- function(array) {
  # Return unique values in original order
  c()
}`,
    "fibonacci": `fibonacci <- function(n) {
  # Return the nth Fibonacci number
  0
}`,
    "prime-number": `is_prime <- function(number) {
  # Return TRUE if number is prime
  FALSE
}`,
    "linear-search": `linear_search <- function(array, target) {
  # Return the index of target or -1
  -1
}`,
  },

  Bash: {
    "hello-world": `#!/usr/bin/env bash

# Print the message below
echo "Hello, World!"`,
    variables: `name="Ada"
age=28

# Display a sentence using both variables`,
    "two-sum": `two_sum() {
  # Return the indices of the two matching numbers
  local target="$1"
}`,
    palindrome: `is_palindrome() {
  # Return true when word reads the same backwards
  local word="$1"
}`,
    fizzbuzz: `for number in {1..100}; do
  # Check divisibility before printing the number
done`,
    "reverse-string": `reverse_string() {
  # Return word with its characters reversed
  local word="$1"
}`,
    factorial: `factorial() {
  # Return the product of every integer from 1 to number
  local number="$1"
}`,
    "count-vowels": `count_vowels() {
  # Return how many vowels appear in word
  local word="$1"
}`,
    "data-types": `name="Alice"
age=30
is_student=false

# Print all three variables`,
    "swap-variables": `a=10
b=20

# Swap the values of a and b`,
    "character-frequency": `character_frequency() {
  # Print character counts for a word
  local word="$1"
}`,
    "find-maximum": `find_maximum() {
  # Return the largest number
  local numbers=("$@")
}`,
    "remove-duplicates": `remove_duplicates() {
  # Return unique values in original order
  local values=("$@")
}`,
    "fibonacci": `fibonacci() {
  # Return the nth Fibonacci number
  local n="$1"
}`,
    "prime-number": `is_prime() {
  # Return true if number is prime
  local number="$1"
}`,
    "linear-search": `linear_search() {
  # Return the index of target or -1
  local target="$1"
}`,
  },
};

const challenges: Challenge[] = [
  {
    id: "hello-world",
    title: "Hello World",
    difficulty: "Easy",
    description:
      "Write a program that prints the exact message Hello, World! to the console.",
    example: 'Output: "Hello, World!"',
    starter: `// Print the message below
console.log("Hello, World!");`,
    concept: "console output",
  },
  {
    id: "variables",
    title: "Variables",
    difficulty: "Easy",
    description:
      "Create variables for a person's name and age, then display them in a readable sentence.",
    example: 'name = "Ada", age = 28 → "Ada is 28 years old."',
    starter: `const name = "Ada";
const age = 28;

// Display a sentence using both variables`,
    concept: "variables and strings",
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy / Medium",
    description:
      "Given an array of integers and a target, return the indices of two numbers that add up to the target.",
    example: "[2, 7, 11, 15], target 9 → [0, 1]",
    starter: `function twoSum(numbers, target) {
  // Return the indices of the two matching numbers
}

console.log(twoSum([2, 7, 11, 15], 9));`,
    concept: "hash maps",
  },
  {
    id: "palindrome",
    title: "Palindrome",
    difficulty: "Easy",
    description:
      "Determine whether a given string reads the same forwards and backwards.",
    example: '"madam" → true · "hello" → false',
    starter: `function isPalindrome(word) {
  // Return true when word reads the same backwards
}

console.log(isPalindrome("madam"));`,
    concept: "string traversal",
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "Easy",
    description:
      "For numbers 1 through 100, print Fizz, Buzz, FizzBuzz, or the number based on its divisibility.",
    example: "3 → Fizz · 5 → Buzz · 15 → FizzBuzz",
    starter: `for (let number = 1; number <= 100; number++) {
  // Check divisibility before printing the number
}`,
    concept: "conditionals and loops",
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    description:
      "Return a new string with the characters of the input arranged in reverse order.",
    example: '"code" → "edoc"',
    starter: `function reverseString(word) {
  // Return word with its characters reversed
}`,
    concept: "string manipulation",
  },
  {
    id: "factorial",
    title: "Factorial",
    difficulty: "Easy",
    description:
      "Calculate the factorial of a non-negative integer by multiplying all integers from 1 through that number.",
    example: "5 → 120",
    starter: `function factorial(number) {
  // Return the product of every integer from 1 to number
}`,
    concept: "iteration",
  },
  {
    id: "count-vowels",
    title: "Count Vowels",
    difficulty: "Easy",
    description:
      "Count how many vowels appear in a string. Treat a, e, i, o, and u as vowels.",
    example: '"education" → 5',
    starter: `function countVowels(word) {
  // Return how many vowels appear in word
}`,
    concept: "character checks",
  },
  {
    id: "data-types",
    title: "Data Types",
    difficulty: "Easy",
    description:
      "Create variables representing a person's name, age, and whether they are a student. Use appropriate data types for each value.",
    example: 'name = "Alice", age = 30, isStudent = false',
    starter: `const name = "Alice";
const age = 30;
const isStudent = false;

// Log all three variables`,
    concept: "data types",
  },
  {
    id: "swap-variables",
    title: "Swap Variables",
    difficulty: "Easy",
    description:
      "Swap the values of two variables so that each variable contains the value previously stored in the other variable.",
    example: "a = 10, b = 20 → a = 20, b = 10",
    starter: `let a = 10;
let b = 20;

// Swap the values of a and b`,
    concept: "variable assignment",
  },
  {
    id: "character-frequency",
    title: "Character Frequency",
    difficulty: "Easy",
    description:
      "Count how many times each character appears in a given string.",
    example: '"hello" → h:1, e:1, l:2, o:1',
    starter: `function characterFrequency(word) {
  // Return an object/map with character counts
}`,
    concept: "hash maps",
  },
  {
    id: "find-maximum",
    title: "Find Maximum",
    difficulty: "Easy",
    description:
      "Find and return the largest number in an array of integers.",
    example: "[3, 7, 2, 9, 4] → 9",
    starter: `function findMaximum(numbers) {
  // Return the largest number
}`,
    concept: "array iteration",
  },
  {
    id: "remove-duplicates",
    title: "Remove Duplicates",
    difficulty: "Easy / Medium",
    description:
      "Return an array containing the unique values from the input array while preserving their original order.",
    example: "[1, 2, 2, 3, 1] → [1, 2, 3]",
    starter: `function removeDuplicates(array) {
  // Return unique values in original order
}`,
    concept: "arrays and sets",
  },
  {
    id: "fibonacci",
    title: "Fibonacci",
    difficulty: "Easy",
    description:
      "Return the nth Fibonacci number, where the sequence starts with 0 and 1.",
    example: "fib(6) → 8",
    starter: `function fibonacci(n) {
  // Return the nth Fibonacci number
}`,
    concept: "recursion",
  },
  {
    id: "prime-number",
    title: "Prime Number",
    difficulty: "Easy",
    description:
      "Determine whether a given integer is a prime number.",
    example: "7 → true · 10 → false",
    starter: `function isPrime(number) {
  // Return true if number is prime
}`,
    concept: "conditionals",
  },
  {
    id: "linear-search",
    title: "Linear Search",
    difficulty: "Easy",
    description:
      "Search an array for a target value and return its index. Return -1 if the target is not present.",
    example: "[4, 8, 15, 16], target 15 → 2",
    starter: `function linearSearch(array, target) {
  // Return the index of target or -1
}`,
    concept: "array search",
  },
];

function App() {
  const [selectedId, setSelectedId] = useState("two-sum");

  const [language, setLanguage] = useState<ProgrammingLanguage>(() => {
    return (
      (localStorage.getItem(
        "codecoach-language"
      ) as ProgrammingLanguage | null) ?? "JavaScript"
    );
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("codecoach-theme");

    return saved === "dark" ? "dark" : "light";
  });

  const [codeByChallenge, setCodeByChallenge] = useState<
    Record<string, string>
  >(() => {
    try {
      return JSON.parse(
        localStorage.getItem("codecoach-code") ?? "{}"
      );
    } catch {
      return {};
    }
  });

  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("codecoach-completed") ?? "[]"
      );
    } catch {
      return [];
    }
  });

  const [hintLevel, setHintLevel] = useState(0);
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] =
    useState<ExplanationResponse | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<
    "run" | "hint" | "explain" | null
  >(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(
      "codecoach-sidebar-width"
    );

    const parsed = saved ? Number(saved) : 265;

    return Number.isFinite(parsed)
      ? Math.min(420, Math.max(200, parsed))
      : 265;
  });

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [isResizingSidebar, setIsResizingSidebar] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState<Section>("practice");

  const [profileAvatar, setProfileAvatar] = useState(
    () =>
      localStorage.getItem("codecoach-profile-avatar") ??
      "👨‍💻"
  );

  const challenge = useMemo(
    () =>
      challenges.find((item) => item.id === selectedId) ??
      challenges[0],
    [selectedId]
  );

  const codeKey = `${language}:${selectedId}`;

  const code =
    codeByChallenge[codeKey] ??
    languageStarters[language][selectedId] ??
    challenge.starter;

  const progress = completed.length;
  const totalChallenges = challenges.length;

  useEffect(() => {
    localStorage.setItem(
      "codecoach-code",
      JSON.stringify(codeByChallenge)
    );
  }, [codeByChallenge]);

  useEffect(() => {
    localStorage.setItem(
      "codecoach-completed",
      JSON.stringify(completed)
    );
  }, [completed]);

  useEffect(() => {
    localStorage.setItem(
      "codecoach-language",
      language
    );
  }, [language]);

  // Save and apply theme immediately.
  useEffect(() => {
    localStorage.setItem("codecoach-theme", theme);

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );
  }, [theme]);

  // Save sidebar width.
  useEffect(() => {
    localStorage.setItem(
      "codecoach-sidebar-width",
      String(sidebarWidth)
    );
  }, [sidebarWidth]);

  // Handle sidebar resizing.
  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(
        420,
        Math.max(200, event.clientX)
      );

      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    document.addEventListener(
      "mousemove",
      handleMouseMove
    );

    document.addEventListener(
      "mouseup",
      handleMouseUp
    );

    return () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };
  }, [isResizingSidebar]);

  // Keep profile avatar synchronized.
  useEffect(() => {
    const updateProfile = () => {
      setProfileAvatar(
        localStorage.getItem(
          "codecoach-profile-avatar"
        ) ?? "👨‍💻"
      );
    };

    updateProfile();

    window.addEventListener(
      "storage",
      updateProfile
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateProfile
      );
    };
  }, [activeSection]);

  const selectChallenge = (id: string) => {
    setSelectedId(id);
    setHintLevel(0);
    setHint("");
    setExplanation(null);
    setResults(null);
    setMessage("");
    setMobileOpen(false);
    setActiveSection("practice");
  };

  const updateCode = (value: string) => {
    setCodeByChallenge((current) => ({
      ...current,
      [codeKey]: value,
    }));
  };

  const changeLanguage = (
    nextLanguage: ProgrammingLanguage
  ) => {
    setLanguage(nextLanguage);
    setHint("");
    setExplanation(null);
    setResults(null);
    setMessage("");
  };

  const changeTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
  };

  const goTo = (section: Section) => {
    setActiveSection(section);
    setMobileOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const runCode = async () => {
    if (!code.trim()) {
      setMessage(
        "Write some code before running tests."
      );
      setResults(null);
      return;
    }

    setLoading("run");
    setMessage("");
    setHint("");
    setExplanation(null);

    try {
      const nextResults = await requestRun(
        selectedId,
        code,
        language
      );

      setResults(nextResults);

      if (
        nextResults.every(
          (item) => item.passed
        )
      ) {
        setCompleted((current) =>
          current.includes(selectedId)
            ? current
            : [...current, selectedId]
        );
      }
    } catch {
      setMessage(
        "Your code is still here. Check the API connection and try running the tests again."
      );
    } finally {
      setLoading(null);
    }
  };

  const getHint = async () => {
    if (!code.trim()) {
      setMessage(
        "Write some code before requesting a hint."
      );
      return;
    }

    if (hintLevel >= 3) {
      setMessage(
        "You have reached the strongest hint. Try explaining your approach next."
      );
      return;
    }

    setLoading("hint");
    setMessage("");
    setExplanation(null);

    try {
      const response = await requestHint(
        selectedId,
        code,
        hintLevel + 1,
        language
      );

      setHintLevel(response.level);
      setHint(response.hint);
    } catch {
      setMessage(
        "Your code is still here. Check the API connection and try the hint again."
      );
    } finally {
      setLoading(null);
    }
  };

  const explainCode = async () => {
    if (!code.trim()) {
      setMessage(
        "Write some code before asking for an explanation."
      );
      return;
    }

    setLoading("explain");
    setMessage("");
    setHint("");

    try {
      setExplanation(
        await requestExplanation(
          selectedId,
          code,
          language
        )
      );
    } catch {
      setMessage(
        "Your code is still here. Check the API connection and try the explanation again."
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => goTo("practice")}
          aria-label="Go to CodeCoach practice"
        >
          <span className="brand-mark">
            <Code2 size={19} />
          </span>

          <span>
            codecoach
            <span className="brand-accent">
              .ai
            </span>
          </span>
        </button>

        <nav
          className="topnav"
          aria-label="Primary navigation"
        >
          <button
            className={
              activeSection === "practice"
                ? "active"
                : ""
            }
            onClick={() => goTo("practice")}
          >
            Practice
          </button>

          <button
            className={
              activeSection === "progress"
                ? "active"
                : ""
            }
            onClick={() => goTo("progress")}
          >
            Progress
          </button>

          <button
            className={
              activeSection === "settings"
                ? "active"
                : ""
            }
            onClick={() => goTo("settings")}
          >
            Settings
          </button>
        </nav>

        <div className="header-progress">
          <span>
            {progress}/{totalChallenges} complete
          </span>

          <div className="mini-track">
            <span
              style={{
                width: `${
                  (progress / totalChallenges) * 100
                }%`,
              }}
            />
          </div>

          <button
            className="avatar"
            aria-label="Open profile"
            onClick={() => goTo("profile")}
          >
            {profileAvatar}
          </button>
        </div>

        <button
          className="mobile-menu"
          aria-label={
            mobileOpen
              ? "Close challenge navigation"
              : "Open challenge navigation"
          }
          onClick={() =>
            setMobileOpen((open) => !open)
          }
        >
          {mobileOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>
      </header>

      <div
        className={`workspace ${
          sidebarCollapsed
            ? "sidebar-collapsed"
            : ""
        }`}
        style={
          sidebarCollapsed
            ? undefined
            : ({
                "--sidebar-width": `${sidebarWidth}px`,
              } as React.CSSProperties)
        }
      >
        <aside
          className={`sidebar ${
            mobileOpen ? "open" : ""
          }`}
          aria-label="Challenge navigation"
        >
          <button
            className="sidebar-collapse"
            onClick={() =>
              setSidebarCollapsed(
                (collapsed) => !collapsed
              )
            }
            aria-label={
              sidebarCollapsed
                ? "Expand challenge sidebar"
                : "Collapse challenge sidebar"
            }
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>

          {!sidebarCollapsed && (
            <div
              className="sidebar-resizer"
              onMouseDown={() =>
                setIsResizingSidebar(true)
              }
              role="separator"
              aria-label="Resize challenge sidebar"
              aria-orientation="vertical"
            />
          )}

          {!sidebarCollapsed && (
            <>
              <div className="sidebar-heading">
                <div>
                  <p className="eyebrow">
                    Your path
                  </p>

                  <h2>Challenges</h2>
                </div>

                <span className="challenge-count">
                  {progress}/{totalChallenges}
                </span>
              </div>

              <div className="challenge-list">
                {challenges.map(
                  (item, index) => {
                    const isComplete =
                      completed.includes(
                        item.id
                      );

                    const isCurrent =
                      selectedId === item.id;

                    return (
                      <button
                        className={`challenge-item ${
                          isCurrent
                            ? "current"
                            : ""
                        }`}
                        key={item.id}
                        onClick={() =>
                          selectChallenge(
                            item.id
                          )
                        }
                      >
                        <span
                          className={`status-icon ${
                            isComplete
                              ? "done"
                              : ""
                          }`}
                        >
                          {isComplete ? (
                            <Check size={14} />
                          ) : isCurrent ? (
                            <ChevronRight
                              size={15}
                            />
                          ) : (
                            <Circle
                              size={12}
                            />
                          )}
                        </span>

                        <span className="challenge-copy">
                          <strong>
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}{" "}
                            · {item.title}
                          </strong>

                          <small>
                            {item.difficulty}
                          </small>
                        </span>

                        {isComplete && (
                          <CheckCircle2
                            className="completion"
                            size={16}
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="sidebar-note">
                <Sparkles size={17} />

                <div>
                  <strong>
                    Keep going
                  </strong>

                  <p>
                    Small wins compound
                    into real skill.
                  </p>
                </div>
              </div>
            </>
          )}
        </aside>

        <main className="main-content">
          {activeSection === "progress" && (
            <Progress
              completed={progress}
              total={totalChallenges}
            />
          )}

          {activeSection === "settings" && (
            <Settings
              language={language}
              onLanguageChange={(value) =>
                changeLanguage(
                  value as ProgrammingLanguage
                )
              }
              theme={theme}
              onThemeChange={changeTheme}
            />
          )}

          {activeSection === "profile" && (
            <Profile />
          )}

          {activeSection === "practice" && (
            <>
              <div className="content-intro">
                <div>
                  <p className="eyebrow warm">
                    Practice lab{" "}
                    <span>·</span>{" "}
                    {challenge.concept}
                  </p>

                  <h1>{challenge.title}</h1>

                  <p className="description">
                    {challenge.description}
                  </p>
                </div>

                <span
                  className={`difficulty ${
                    challenge.difficulty ===
                    "Easy / Medium"
                      ? "medium"
                      : ""
                  }`}
                >
                  <Zap size={14} />{" "}
                  {challenge.difficulty}
                </span>
              </div>

              <div className="example-strip">
                <Info size={16} />

                <span>
                  <strong>Example</strong>
                  {challenge.example}
                </span>
              </div>

              <section
                className="editor-panel"
                aria-labelledby="editor-heading"
              >
                <div className="panel-toolbar">
                  <div className="file-tab">
                    <span className="file-dot" />

                    solution.{languageExtensions[language]}
                  </div>

                  <label
                    className="language-select-label"
                    htmlFor="language-select"
                  >
                    Language
                  </label>

                  <select
                    id="language-select"
                    className="language-select"
                    value={language}
                    onChange={(event) =>
                      changeLanguage(
                        event.target
                          .value as ProgrammingLanguage
                      )
                    }
                  >
                    {languages.map(
                      (item) => (
                        <option key={item}>
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <label
                  id="editor-heading"
                  className="sr-only"
                  htmlFor="code-editor"
                >
                  Your solution code in{" "}
                  {language}
                </label>

                <textarea
                  id="code-editor"
                  className="code-editor"
                  value={code}
                  onChange={(event) =>
                    updateCode(
                      event.target.value
                    )
                  }
                  spellCheck={false}
                  aria-describedby="editor-help"
                />

                <div className="editor-footer">
                  <span id="editor-help">
                    <Terminal size={14} />{" "}
                    {language} · controlled
                    challenge evaluator
                  </span>

                  <span>
                    {
                      code.split("\n")
                        .length
                    }{" "}
                    lines
                  </span>
                </div>
              </section>

              {message && (
                <div
                  className="inline-message"
                  role="alert"
                >
                  <AlertCircle
                    size={17}
                  />{" "}
                  {message}
                </div>
              )}

              <div className="action-row">
                <button
                  className="run-button"
                  onClick={runCode}
                  disabled={
                    loading !== null
                  }
                >
                  <Play
                    size={17}
                    fill="currentColor"
                  />

                  {loading === "run"
                    ? "Running..."
                    : "Run tests"}
                </button>

                <button
                  className="secondary-button"
                  onClick={getHint}
                  disabled={
                    loading !== null ||
                    hintLevel >= 3
                  }
                >
                  <Lightbulb
                    size={17}
                  />

                  {loading === "hint"
                    ? "Thinking..."
                    : `Get hint ${hintLevel}/3`}
                </button>

                <button
                  className="secondary-button"
                  onClick={explainCode}
                  disabled={
                    loading !== null
                  }
                >
                  <BookOpen size={17} />

                  {loading === "explain"
                    ? "Analyzing..."
                    : "Explain code"}
                </button>

                <button
                  className="reset-button"
                  onClick={() =>
                    updateCode(
                      languageStarters[
                        language
                      ][selectedId] ??
                        challenge.starter
                    )
                  }
                  aria-label="Reset code"
                  title="Reset code"
                >
                  <RotateCcw
                    size={17}
                  />
                </button>
              </div>

              <div className="feedback-grid">
                <section
                  className={`feedback-panel ${
                    results
                      ? "has-content"
                      : ""
                  }`}
                  aria-live="polite"
                >
                  <div className="feedback-heading">
                    <div>
                      <p className="eyebrow">
                        Verification
                      </p>

                      <h2>
                        Test results
                      </h2>
                    </div>

                    {results && (
                      <span
                        className={
                          results.every(
                            (item) =>
                              item.passed
                          )
                            ? "result-pill success"
                            : "result-pill"
                        }
                      >
                        {results.every(
                          (item) =>
                            item.passed
                        )
                          ? "All passed"
                          : "Keep iterating"}
                      </span>
                    )}
                  </div>

                  {results ? (
                    <div className="results-list">
                      {results.map(
                        (result) => (
                          <div
                            className="result-row"
                            key={
                              result.label
                            }
                          >
                            <span
                              className={
                                result.passed
                                  ? "result-icon passed"
                                  : "result-icon failed"
                              }
                            >
                              {result.passed ? (
                                <Check
                                  size={
                                    14
                                  }
                                />
                              ) : (
                                <X
                                  size={
                                    14
                                  }
                                />
                              )}
                            </span>

                            <span>
                              <strong>
                                {
                                  result.label
                                }{" "}
                                {result.passed
                                  ? "passed"
                                  : "needs work"}
                              </strong>

                              <small>
                                Expected:{" "}
                                {
                                  result.expected
                                }{" "}
                                ·{" "}
                                {
                                  result.received
                                }
                              </small>
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="empty-feedback">
                      <Terminal
                        size={24}
                      />

                      <p>
                        Run your solution
                        to see how it
                        holds up.
                      </p>

                      <span>
                        Tests are designed
                        to give you a
                        clear next step.
                      </span>
                    </div>
                  )}
                </section>

                <section
                  className={`feedback-panel ai-panel ${
                    hint ||
                    explanation
                      ? "has-content"
                      : ""
                  }`}
                  aria-live="polite"
                >
                  <div className="feedback-heading">
                    <div>
                      <p className="eyebrow">
                        Tutor notes
                      </p>

                      <h2>
                        AI feedback
                      </h2>
                    </div>

                    <Sparkles
                      size={18}
                      className="sparkle"
                    />
                  </div>

                  {hint ? (
                    <div className="hint-content">
                      <span className="hint-label">
                        HINT{" "}
                        {hintLevel}

                        <span className="hint-dots">
                          {[1, 2, 3].map(
                            (level) => (
                              <i
                                className={
                                  level <=
                                  hintLevel
                                    ? "filled"
                                    : ""
                                }
                                key={
                                  level
                                }
                              />
                            )
                          )}
                        </span>
                      </span>

                      <p>
                        {hint}
                      </p>

                      <small>
                        Hints get more
                        specific as
                        you work. You
                        are still
                        driving.
                      </small>
                    </div>
                  ) : explanation ? (
                    <div className="explanation">
                      <strong>
                        What your code does
                      </strong>

                      <p>
                        {
                          explanation.summary
                        }
                      </p>

                      <strong>
                        Step by step
                      </strong>

                      <ul>
                        {explanation.steps.map(
                          (step) => (
                            <li key={step}>
                              {step}
                            </li>
                          )
                        )}
                      </ul>

                      <strong>
                        Potential issue
                      </strong>

                      <p>
                        {explanation
                          .issues[0] ??
                          "No obvious issues were identified."}
                      </p>

                      <strong>
                        Learning takeaway
                      </strong>

                      <p>
                        {
                          explanation.learningTakeaway
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="empty-feedback">
                      <Lightbulb
                        size={24}
                      />

                      <p>
                        Your tutor is
                        ready when you
                        are.
                      </p>

                      <span>
                        Ask for a hint
                        when you feel
                        stuck, or
                        request an
                        explanation
                        after you try.
                      </span>
                    </div>
                  )}
                </section>
              </div>

              <div className="footer-tip">
                <CheckCircle2
                  size={16}
                />

                Passing all tests
                marks this challenge
                complete

                <span>·</span>

                Progress saves
                automatically
              </div>
            </>
          )}
        </main>
      </div>

      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile navigation"
      >
        <button
          className={
            activeSection === "practice"
              ? "active"
              : ""
          }
          onClick={() =>
            goTo("practice")
          }
        >
          <Code2 size={20} />
          <span>Practice</span>
        </button>

        <button
          className={
            activeSection === "progress"
              ? "active"
              : ""
          }
          onClick={() =>
            goTo("progress")
          }
        >
          <BarChart3 size={20} />
          <span>Progress</span>
        </button>

        <button
          className={
            activeSection === "settings"
              ? "active"
              : ""
          }
          onClick={() =>
            goTo("settings")
          }
        >
          <SettingsIcon
            size={20}
          />
          <span>Settings</span>
        </button>

        <button
          className={
            activeSection === "profile"
              ? "active"
              : ""
          }
          onClick={() =>
            goTo("profile")
          }
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
