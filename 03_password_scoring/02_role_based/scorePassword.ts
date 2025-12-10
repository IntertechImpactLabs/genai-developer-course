/**
 * Password Scoring Utility
 * A comprehensive password strength evaluator based on modern security best practices
 */

/**
 * Generated on Claude.ai using Opus 4.5
 *
 * Prompt:
 * Act as a cybersecurity architect to design a TypeScript password scoring utility function.
 */

interface PasswordScore {
  score: number; // 0-100
  strength: "very-weak" | "weak" | "fair" | "strong" | "very-strong";
  feedback: string[];
  details: ScoreBreakdown;
}

interface ScoreBreakdown {
  length: number;
  characterDiversity: number;
  patterns: number;
  entropy: number;
  commonPassword: number;
}

// Common passwords (abbreviated list - in production, use a comprehensive list)
const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "letmein",
  "dragon",
  "111111",
  "baseball",
  "iloveyou",
  "trustno1",
  "sunshine",
  "master",
  "welcome",
  "shadow",
  "ashley",
  "football",
  "jesus",
  "michael",
  "ninja",
  "mustang",
  "password1",
  "password123",
  "admin",
  "administrator",
]);

// Common patterns to penalize
const KEYBOARD_PATTERNS = [
  "qwerty",
  "asdf",
  "zxcv",
  "qazwsx",
  "1234",
  "4321",
  "0987",
  "7890",
];

const REPEATED_CHAR_REGEX = /(.)\1{2,}/;
const SEQUENTIAL_REGEX =
  /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;

/**
 * Calculate the entropy of a password in bits
 */
function calculateEntropy(password: string): number {
  const charsetSize = getCharsetSize(password);
  return password.length * Math.log2(charsetSize);
}

/**
 * Determine the character set size based on characters used
 */
function getCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Common special chars
  return size || 1;
}

/**
 * Score password length (0-25 points)
 */
function scoreLengthComponent(password: string): {
  score: number;
  feedback: string[];
} {
  const len = password.length;
  const feedback: string[] = [];

  if (len < 8) {
    feedback.push("Password should be at least 8 characters long");
    return { score: Math.max(0, len * 2), feedback };
  }
  if (len < 12) {
    feedback.push("Consider using 12+ characters for better security");
    return { score: 10 + (len - 8) * 2, feedback };
  }
  if (len < 16) {
    return { score: 18 + (len - 12), feedback };
  }
  return { score: 25, feedback };
}

/**
 * Score character diversity (0-25 points)
 */
function scoreCharacterDiversity(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const categories = [hasLower, hasUpper, hasDigit, hasSpecial].filter(
    Boolean
  ).length;

  if (!hasLower) feedback.push("Add lowercase letters");
  if (!hasUpper) feedback.push("Add uppercase letters");
  if (!hasDigit) feedback.push("Add numbers");
  if (!hasSpecial) feedback.push("Add special characters (!@#$%^&*)");

  switch (categories) {
    case 1:
      score = 5;
      break;
    case 2:
      score = 12;
      break;
    case 3:
      score = 20;
      break;
    case 4:
      score = 25;
      break;
  }

  return { score, feedback };
}

/**
 * Penalize common patterns (0-25 points, starts at 25 and deducts)
 */
function scorePatterns(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let penalty = 0;
  const lowerPassword = password.toLowerCase();

  // Check keyboard patterns
  for (const pattern of KEYBOARD_PATTERNS) {
    if (lowerPassword.includes(pattern)) {
      penalty += 8;
      feedback.push("Avoid keyboard patterns like 'qwerty' or '1234'");
      break;
    }
  }

  // Check repeated characters
  if (REPEATED_CHAR_REGEX.test(password)) {
    penalty += 7;
    feedback.push("Avoid repeating characters (e.g., 'aaa')");
  }

  // Check sequential characters
  if (SEQUENTIAL_REGEX.test(lowerPassword)) {
    penalty += 7;
    feedback.push("Avoid sequential characters (e.g., 'abc', '123')");
  }

  // Check if password is all same case letters or all digits
  if (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password)) {
    penalty += 5;
  }
  if (/^\d+$/.test(password)) {
    penalty += 10;
    feedback.push("Avoid using only numbers");
  }

  return { score: Math.max(0, 25 - penalty), feedback };
}

/**
 * Score based on entropy (0-15 points)
 */
function scoreEntropy(password: string): { score: number; feedback: string[] } {
  const entropy = calculateEntropy(password);
  const feedback: string[] = [];

  // Target: 60+ bits is considered strong
  if (entropy < 28) {
    feedback.push("Password is too predictable");
    return { score: 0, feedback };
  }
  if (entropy < 36) {
    return { score: 3, feedback };
  }
  if (entropy < 50) {
    return { score: 8, feedback };
  }
  if (entropy < 60) {
    return { score: 12, feedback };
  }
  return { score: 15, feedback };
}

/**
 * Check against common passwords (0 or 10 points)
 */
function scoreCommonPassword(password: string): {
  score: number;
  feedback: string[];
} {
  const lowerPassword = password.toLowerCase();
  const feedback: string[] = [];

  // Direct match
  if (COMMON_PASSWORDS.has(lowerPassword)) {
    feedback.push("This is a commonly used password - choose something unique");
    return { score: 0, feedback };
  }

  // Check if common password is contained within
  for (const common of COMMON_PASSWORDS) {
    if (lowerPassword.includes(common) && common.length >= 4) {
      feedback.push(
        "Avoid basing your password on common words like '" + common + "'"
      );
      return { score: 3, feedback };
    }
  }

  return { score: 10, feedback };
}

/**
 * Convert numeric score to strength label
 */
function getStrengthLabel(score: number): PasswordScore["strength"] {
  if (score < 20) return "very-weak";
  if (score < 40) return "weak";
  if (score < 60) return "fair";
  if (score < 80) return "strong";
  return "very-strong";
}

/**
 * Main password scoring function
 */
export function scorePassword(password: string): PasswordScore {
  if (!password) {
    return {
      score: 0,
      strength: "very-weak",
      feedback: ["Please enter a password"],
      details: {
        length: 0,
        characterDiversity: 0,
        patterns: 0,
        entropy: 0,
        commonPassword: 0,
      },
    };
  }

  const lengthResult = scoreLengthComponent(password);
  const diversityResult = scoreCharacterDiversity(password);
  const patternsResult = scorePatterns(password);
  const entropyResult = scoreEntropy(password);
  const commonResult = scoreCommonPassword(password);

  const totalScore = Math.min(
    100,
    lengthResult.score +
      diversityResult.score +
      patternsResult.score +
      entropyResult.score +
      commonResult.score
  );

  // Collect unique feedback items
  const allFeedback = [
    ...lengthResult.feedback,
    ...diversityResult.feedback,
    ...patternsResult.feedback,
    ...entropyResult.feedback,
    ...commonResult.feedback,
  ];
  const uniqueFeedback = [...new Set(allFeedback)];

  return {
    score: totalScore,
    strength: getStrengthLabel(totalScore),
    feedback: uniqueFeedback.slice(0, 3), // Limit to top 3 suggestions
    details: {
      length: lengthResult.score,
      characterDiversity: diversityResult.score,
      patterns: patternsResult.score,
      entropy: entropyResult.score,
      commonPassword: commonResult.score,
    },
  };
}

// Example usage and tests
function demonstrateUsage() {
  const testPasswords = [
    "password",
    "abc123",
    "MyP@ssw0rd",
    "correcthorsebatterystaple",
    "Tr0ub4dor&3",
    "xK9#mP2$vL7@nQ4!",
  ];

  console.log("Password Strength Analysis\n" + "=".repeat(50));

  for (const pwd of testPasswords) {
    const result = scorePassword(pwd);
    console.log(`\nPassword: "${pwd}"`);
    console.log(`Score: ${result.score}/100 (${result.strength})`);
    console.log(`Breakdown:`, result.details);
    if (result.feedback.length > 0) {
      console.log(`Suggestions:`);
      result.feedback.forEach((f) => console.log(`  • ${f}`));
    }
  }
}

demonstrateUsage();
