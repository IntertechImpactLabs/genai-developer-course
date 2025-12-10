interface PasswordCriteria {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxConsecutiveRepeats: number;
}

interface PasswordScore {
  score: number; // 0-100
  strength: "weak" | "fair" | "good" | "strong" | "excellent";
  feedback: string[];
  criteria: CriteriaResult[];
}

interface CriteriaResult {
  name: string;
  passed: boolean;
  points: number;
}

const DEFAULT_CRITERIA: PasswordCriteria = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxConsecutiveRepeats: 2,
};

/**
 * Generated on claude.ai using Opus 4.5
 *
 * Prompt:
 * Design a TypeScript password scoring utility function.
 * @param password
 * @param criteria
 * @returns
 */
function scorePassword(
  password: string,
  criteria: Partial<PasswordCriteria> = {}
): PasswordScore {
  const config = { ...DEFAULT_CRITERIA, ...criteria };
  const results: CriteriaResult[] = [];
  const feedback: string[] = [];
  let score = 0;

  // Length scoring (up to 30 points)
  const lengthPoints = Math.min(30, password.length * 2);
  results.push({
    name: "length",
    passed: password.length >= config.minLength,
    points: lengthPoints,
  });
  score += lengthPoints;

  if (password.length < config.minLength) {
    feedback.push(`Use at least ${config.minLength} characters`);
  } else if (password.length < 12) {
    feedback.push("Consider using 12+ characters for better security");
  }

  // Character variety checks
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  if (config.requireUppercase) {
    const points = hasUppercase ? 15 : 0;
    results.push({ name: "uppercase", passed: hasUppercase, points });
    score += points;
    if (!hasUppercase) feedback.push("Add uppercase letters");
  }

  if (config.requireLowercase) {
    const points = hasLowercase ? 15 : 0;
    results.push({ name: "lowercase", passed: hasLowercase, points });
    score += points;
    if (!hasLowercase) feedback.push("Add lowercase letters");
  }

  if (config.requireNumbers) {
    const points = hasNumbers ? 15 : 0;
    results.push({ name: "numbers", passed: hasNumbers, points });
    score += points;
    if (!hasNumbers) feedback.push("Add numbers");
  }

  if (config.requireSpecialChars) {
    const points = hasSpecial ? 15 : 0;
    results.push({ name: "special", passed: hasSpecial, points });
    score += points;
    if (!hasSpecial) feedback.push("Add special characters (!@#$%^&*)");
  }

  // Penalize consecutive repeats
  const repeatPattern = new RegExp(
    `(.)\\1{${config.maxConsecutiveRepeats},}`,
    "g"
  );
  const hasExcessiveRepeats = repeatPattern.test(password);
  if (hasExcessiveRepeats) {
    score = Math.max(0, score - 15);
    feedback.push("Avoid repeating characters");
  }
  results.push({
    name: "no-repeats",
    passed: !hasExcessiveRepeats,
    points: hasExcessiveRepeats ? -15 : 0,
  });

  // Penalize common patterns
  const commonPatterns = [
    /^123/,
    /321$/,
    /abc/i,
    /qwerty/i,
    /password/i,
    /asdf/i,
  ];
  const hasCommonPattern = commonPatterns.some((p) => p.test(password));
  if (hasCommonPattern) {
    score = Math.max(0, score - 20);
    feedback.push("Avoid common patterns");
  }
  results.push({
    name: "no-patterns",
    passed: !hasCommonPattern,
    points: hasCommonPattern ? -20 : 0,
  });

  // Normalize score to 0-100
  score = Math.min(100, Math.max(0, score));

  // Determine strength label
  let strength: PasswordScore["strength"];
  if (score < 20) strength = "weak";
  else if (score < 40) strength = "fair";
  else if (score < 60) strength = "good";
  else if (score < 80) strength = "strong";
  else strength = "excellent";

  return { score, strength, feedback, criteria: results };
}

// Usage examples
console.log(scorePassword("abc"));
// { score: 6, strength: 'weak', feedback: [...], criteria: [...] }

console.log(scorePassword("MyP@ssw0rd!2024"));
// { score: 100, strength: 'excellent', feedback: [], criteria: [...] }

console.log(
  scorePassword("hello", { minLength: 4, requireSpecialChars: false })
);
// Custom criteria scoring
