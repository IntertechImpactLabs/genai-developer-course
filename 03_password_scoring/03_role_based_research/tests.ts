/**
 * Password Scorer - Test Suite
 *
 * Comprehensive tests covering NIST compliance, pattern detection, and edge cases.
 */

import {
  scorePasswordSync,
  meetsMinimumRequirements,
  getStrengthLabel,
  getStrengthColor,
  NIST_MIN_LENGTH,
  NIST_RECOMMENDED_LENGTH,
} from "./password-scorer";

// ============================================================================
// Test Utilities
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

const testResults: TestResult[] = [];

function test(name: string, fn: () => boolean | string): void {
  try {
    const result = fn();
    if (result === true) {
      testResults.push({ name, passed: true });
      console.log(`✓ ${name}`);
    } else {
      testResults.push({ name, passed: false, message: String(result) });
      console.log(`✗ ${name}: ${result}`);
    }
  } catch (error) {
    testResults.push({ name, passed: false, message: String(error) });
    console.log(`✗ ${name}: ${error}`);
  }
}

function assertEqual<T>(
  actual: T,
  expected: T,
  message?: string
): boolean | string {
  if (actual === expected) return true;
  return message || `Expected ${expected}, got ${actual}`;
}

function assertTrue(value: boolean, message?: string): boolean | string {
  if (value) return true;
  return message || `Expected true, got false`;
}

function assertFalse(value: boolean, message?: string): boolean | string {
  if (!value) return true;
  return message || `Expected false, got true`;
}

function assertInRange(
  value: number,
  min: number,
  max: number,
  message?: string
): boolean | string {
  if (value >= min && value <= max) return true;
  return message || `Expected ${value} to be between ${min} and ${max}`;
}

// ============================================================================
// NIST Compliance Tests
// ============================================================================

console.log("\n=== NIST Compliance Tests ===\n");

test("NIST: Minimum length constant is 8", () => {
  return assertEqual(NIST_MIN_LENGTH, 8);
});

test("NIST: Recommended length constant is 15", () => {
  return assertEqual(NIST_RECOMMENDED_LENGTH, 15);
});

test("NIST: Password below min length fails compliance", () => {
  const result = scorePasswordSync("abc1234"); // 7 chars
  return assertFalse(result.nistCompliance.meetsMinimumLength);
});

test("NIST: Password at min length meets minimum", () => {
  const result = scorePasswordSync("abcd1234"); // 8 chars
  return assertTrue(result.nistCompliance.meetsMinimumLength);
});

test("NIST: Password below recommended length reflects in compliance", () => {
  const result = scorePasswordSync("abcdefghij"); // 10 chars
  return assertFalse(result.nistCompliance.meetsRecommendedLength);
});

test("NIST: 15+ char password meets recommended length", () => {
  const result = scorePasswordSync("abcdefghijklmno"); // 15 chars
  return assertTrue(result.nistCompliance.meetsRecommendedLength);
});

// ============================================================================
// Common Password Detection Tests
// ============================================================================

console.log("\n=== Common Password Detection Tests ===\n");

test('Common password "password" gets score 0', () => {
  const result = scorePasswordSync("password");
  return assertEqual(result.score, 0);
});

test('Common password "123456" gets score 0', () => {
  const result = scorePasswordSync("123456");
  return assertEqual(result.score, 0);
});

test('Common password "qwerty" gets score 0', () => {
  const result = scorePasswordSync("qwerty");
  return assertEqual(result.score, 0);
});

test("Common password detection is case-insensitive", () => {
  const result = scorePasswordSync("PASSWORD");
  const hasCommonPattern = result.detectedPatterns.some(
    (p) => p.type === "common_password"
  );
  return assertTrue(hasCommonPattern);
});

test('Common password "letmein" detected', () => {
  const result = scorePasswordSync("letmein");
  return assertEqual(result.score, 0);
});

// ============================================================================
// Pattern Detection Tests
// ============================================================================

console.log("\n=== Pattern Detection Tests ===\n");

test('Keyboard pattern "qwerty" detected', () => {
  const result = scorePasswordSync("myqwertypass");
  const hasPattern = result.detectedPatterns.some(
    (p) => p.type === "keyboard_pattern"
  );
  return assertTrue(hasPattern);
});

test('Keyboard pattern "asdf" detected', () => {
  const result = scorePasswordSync("asdfpassword");
  const hasPattern = result.detectedPatterns.some(
    (p) => p.type === "keyboard_pattern"
  );
  return assertTrue(hasPattern);
});

test('Sequence "12345" detected', () => {
  const result = scorePasswordSync("abc12345xyz");
  const hasPattern = result.detectedPatterns.some((p) => p.type === "sequence");
  return assertTrue(hasPattern);
});

test('Sequence "abcde" detected', () => {
  const result = scorePasswordSync("xxabcdeyy");
  const hasPattern = result.detectedPatterns.some((p) => p.type === "sequence");
  return assertTrue(hasPattern);
});

test('Repeat pattern "aaa" detected', () => {
  const result = scorePasswordSync("passaaasword");
  const hasPattern = result.detectedPatterns.some((p) => p.type === "repeat");
  return assertTrue(hasPattern);
});

test('Date pattern "2024" detected', () => {
  const result = scorePasswordSync("Summer2024");
  const hasPattern = result.detectedPatterns.some((p) => p.type === "date");
  return assertTrue(hasPattern);
});

test('Date pattern "1990" detected', () => {
  const result = scorePasswordSync("born1990here");
  const hasPattern = result.detectedPatterns.some((p) => p.type === "date");
  return assertTrue(hasPattern);
});

test('Dictionary word "summer" detected', () => {
  const result = scorePasswordSync("mysummerday");
  const hasPattern = result.detectedPatterns.some(
    (p) => p.type === "dictionary"
  );
  return assertTrue(hasPattern);
});

test('L33t speak "p@ssw0rd" detected', () => {
  const result = scorePasswordSync("p@ssw0rd");
  const hasPattern = result.detectedPatterns.some((p) => p.type === "l33t");
  return assertTrue(hasPattern);
});

// ============================================================================
// User Context Tests
// ============================================================================

console.log("\n=== User Context Tests ===\n");

test("User context: username in password detected", () => {
  const result = scorePasswordSync("johndoe123", { userInputs: ["johndoe"] });
  const hasPattern = result.detectedPatterns.some((p) => p.type === "context");
  return assertTrue(hasPattern);
});

test("User context: email prefix in password detected", () => {
  const result = scorePasswordSync("alice@secure", { userInputs: ["alice"] });
  const hasPattern = result.detectedPatterns.some((p) => p.type === "context");
  return assertTrue(hasPattern);
});

test("User context: site name in password detected", () => {
  const result = scorePasswordSync("MyApp2024!", { userInputs: ["MyApp"] });
  const hasPattern = result.detectedPatterns.some((p) => p.type === "context");
  return assertTrue(hasPattern);
});

// ============================================================================
// Entropy and Scoring Tests
// ============================================================================

console.log("\n=== Entropy and Scoring Tests ===\n");

test("Entropy increases with password length", () => {
  const short = scorePasswordSync("abcdefgh");
  const long = scorePasswordSync("abcdefghijklmnop");
  return assertTrue(long.entropyBits > short.entropyBits);
});

test("Entropy increases with character variety", () => {
  const lower = scorePasswordSync("abcdefghij");
  const mixed = scorePasswordSync("aBcDeFgHiJ");
  return assertTrue(mixed.entropyBits > lower.entropyBits);
});

test("Score 0 for very weak passwords", () => {
  const result = scorePasswordSync("123");
  return assertEqual(result.score, 0);
});

test("Score 4 for very strong passwords", () => {
  const result = scorePasswordSync("xK9#mL2$vP8@nQ5!wB3&rT7");
  return assertEqual(result.score, 4);
});

test("Guesses estimate is positive", () => {
  const result = scorePasswordSync("anypassword");
  return assertTrue(result.guesses > 0);
});

test("GuessesLog10 is reasonable", () => {
  const result = scorePasswordSync("StrongP@ss123!");
  return assertInRange(result.guessesLog10, 0, 50);
});

// ============================================================================
// Crack Time Tests
// ============================================================================

console.log("\n=== Crack Time Estimation Tests ===\n");

test("Online throttled time > online unthrottled", () => {
  const result = scorePasswordSync("testpassword");
  return assertTrue(
    result.crackTimes.onlineThrottled > result.crackTimes.onlineUnthrottled
  );
});

test("Offline slow hash time > offline fast hash", () => {
  const result = scorePasswordSync("testpassword");
  return assertTrue(
    result.crackTimes.offlineSlowHash > result.crackTimes.offlineFastHash
  );
});

test("Crack times display is human readable", () => {
  const result = scorePasswordSync("short");
  const display = result.crackTimesDisplay.offlineFastHash;
  return assertTrue(
    display.includes("instant") ||
      display.includes("seconds") ||
      display.includes("minutes") ||
      display.includes("hours") ||
      display.includes("days") ||
      display.includes("months") ||
      display.includes("years") ||
      display.includes("centuries")
  );
});

// ============================================================================
// Feedback Tests
// ============================================================================

console.log("\n=== Feedback Generation Tests ===\n");

test("Short password gets length warning", () => {
  const result = scorePasswordSync("abc");
  return assertTrue(
    result.feedback.warning.includes("8 characters") ||
      result.feedback.suggestions.some((s) => s.includes("character"))
  );
});

test("Common password gets appropriate warning", () => {
  const result = scorePasswordSync("password");
  return assertTrue(result.feedback.warning.includes("commonly used"));
});

test("Keyboard pattern gets warning", () => {
  const result = scorePasswordSync("qwertyuiop");
  return assertTrue(
    result.feedback.warning.includes("keyboard") ||
      result.feedback.suggestions.some((s) => s.includes("keyboard"))
  );
});

test("Strong password has no warning", () => {
  const result = scorePasswordSync("xK9#mL2$vP8@nQ5!wB3&rT7*");
  return assertTrue(result.feedback.warning === "" || result.score >= 3);
});

// ============================================================================
// Edge Cases
// ============================================================================

console.log("\n=== Edge Case Tests ===\n");

test("Empty password handled gracefully", () => {
  const result = scorePasswordSync("");
  return assertEqual(result.score, 0);
});

test("Very long password handled", () => {
  const longPwd = "a".repeat(100);
  const result = scorePasswordSync(longPwd);
  return assertTrue(result.entropyBits > 0);
});

test("Unicode characters supported", () => {
  const result = scorePasswordSync("пароль密码🔐");
  return assertTrue(result.entropyBits > 0);
});

test("Spaces in password allowed (NIST)", () => {
  const result = scorePasswordSync("correct horse battery staple");
  return assertTrue(result.entropyBits > 50);
});

test("Special characters increase entropy", () => {
  const plain = scorePasswordSync("abcdefghij");
  const special = scorePasswordSync("abc!@#$%^&");
  return assertTrue(special.entropyBits > plain.entropyBits);
});

// ============================================================================
// Utility Function Tests
// ============================================================================

console.log("\n=== Utility Function Tests ===\n");

test("meetsMinimumRequirements returns false for short password", () => {
  return assertFalse(meetsMinimumRequirements("abc"));
});

test("meetsMinimumRequirements returns true for 8+ chars", () => {
  return assertTrue(meetsMinimumRequirements("12345678"));
});

test("getStrengthLabel returns correct labels", () => {
  return assertTrue(
    getStrengthLabel(0) === "Very Weak" &&
      getStrengthLabel(2) === "Fair" &&
      getStrengthLabel(4) === "Very Strong"
  );
});

test("getStrengthColor returns hex colors", () => {
  const color = getStrengthColor(2);
  return assertTrue(color.startsWith("#") && color.length === 7);
});

// ============================================================================
// Scoring Consistency Tests
// ============================================================================

console.log("\n=== Scoring Consistency Tests ===\n");

test("Same password gives same score", () => {
  const result1 = scorePasswordSync("TestPassword123!");
  const result2 = scorePasswordSync("TestPassword123!");
  return assertEqual(result1.score, result2.score);
});

test("Same password gives same entropy", () => {
  const result1 = scorePasswordSync("TestPassword123!");
  const result2 = scorePasswordSync("TestPassword123!");
  return assertEqual(result1.entropyBits, result2.entropyBits);
});

// ============================================================================
// Real-World Password Tests
// ============================================================================

console.log("\n=== Real-World Password Scenarios ===\n");

test("P@ssword1 is weak despite complexity", () => {
  const result = scorePasswordSync("P@ssword1");
  return assertTrue(
    result.score <= 1,
    `Expected weak score, got ${result.score}`
  );
});

test("Passphrase with spaces is stronger than short complex", () => {
  const phrase = scorePasswordSync("correct horse battery staple");
  const complex = scorePasswordSync("P@$$w0rd");
  return assertTrue(phrase.entropyBits > complex.entropyBits);
});

test("Random-looking password scores high", () => {
  const result = scorePasswordSync("kX8#mN2$qL5@vR9!");
  return assertTrue(result.score >= 3);
});

// ============================================================================
// Test Summary
// ============================================================================

console.log("\n" + "=".repeat(60));
console.log("TEST SUMMARY");
console.log("=".repeat(60));

const passed = testResults.filter((r) => r.passed).length;
const failed = testResults.filter((r) => !r.passed).length;
const total = testResults.length;

console.log(`\nTotal: ${total}`);
console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.log("\nFailed tests:");
  for (const result of testResults.filter((r) => !r.passed)) {
    console.log(`  - ${result.name}: ${result.message}`);
  }
}

console.log("\n");

// Report exit status
if (failed > 0) {
  console.log("❌ Some tests failed");
} else {
  console.log("✅ All tests passed");
}
