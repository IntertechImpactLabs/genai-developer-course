/**
 * Password Scorer - Usage Examples
 *
 * Demonstrates how to use the password scoring utility in various scenarios.
 */

import {
  scorePassword,
  scorePasswordSync,
  meetsMinimumRequirements,
  getStrengthLabel,
  getStrengthColor,
  NIST_MIN_LENGTH,
  NIST_RECOMMENDED_LENGTH,
  type PasswordScore,
  type ScoringOptions,
} from "./password-scorer";

// ============================================================================
// Example 1: Basic Synchronous Usage
// ============================================================================

function basicExample() {
  console.log("=== Basic Synchronous Usage ===\n");

  const passwords = [
    "password", // Common password
    "P@ssw0rd!", // Looks complex but predictable
    "correct horse battery staple", // Famous XKCD passphrase
    "Tr0ub4dor&3", // Famous weak password
    "dK#9xL$mQ2@vP8nR", // Random-looking
    "MyDogSpotIsCute2024!", // Personal info + date
  ];

  for (const pwd of passwords) {
    const result = scorePasswordSync(pwd);
    console.log(`Password: "${pwd}"`);
    console.log(
      `  Score: ${result.score}/4 (${getStrengthLabel(result.score)})`
    );
    console.log(`  Entropy: ${result.entropyBits} bits`);
    console.log(
      `  Crack time (offline slow): ${result.crackTimesDisplay.offlineSlowHash}`
    );
    if (result.feedback.warning) {
      console.log(`  Warning: ${result.feedback.warning}`);
    }
    if (result.feedback.suggestions.length > 0) {
      console.log(`  Suggestions: ${result.feedback.suggestions.join("; ")}`);
    }
    console.log();
  }
}

// ============================================================================
// Example 2: Async Usage with HIBP Check
// ============================================================================

async function hibpExample() {
  console.log("=== Async Usage with Have I Been Pwned Check ===\n");

  const passwords = [
    "password123",
    "correcthorsebatterystaple",
    "xK9#mL2$vP8@nQ",
  ];

  for (const pwd of passwords) {
    const result = await scorePassword(pwd, { checkHibp: true });
    console.log(`Password: "${pwd}"`);
    console.log(
      `  Score: ${result.score}/4 (${getStrengthLabel(result.score)})`
    );
    console.log(`  NIST Compliant: ${result.nistCompliance.compliant}`);

    if (result.isCompromised !== undefined) {
      if (result.isCompromised) {
        console.log(
          `  ⚠️ COMPROMISED! Seen ${result.breachCount?.toLocaleString()} times in breaches`
        );
      } else {
        console.log(`  ✓ Not found in known breaches`);
      }
    }
    console.log();
  }
}

// ============================================================================
// Example 3: User Context Scoring
// ============================================================================

function userContextExample() {
  console.log("=== Scoring with User Context ===\n");

  // Simulating a user registration scenario
  const userInfo = {
    username: "john_doe",
    email: "johndoe@example.com",
    siteName: "MyApp",
  };

  const emailPrefix = userInfo.email.split("@")[0] ?? "";
  const options: ScoringOptions = {
    userInputs: [
      userInfo.username,
      emailPrefix, // 'johndoe'
      userInfo.siteName,
    ],
  };

  const passwords = [
    "john_doe2024", // Contains username
    "JohnDoe!MyApp", // Contains username variant and site name
    "totally_random_pass", // No user context
  ];

  for (const pwd of passwords) {
    const result = scorePasswordSync(pwd, options);
    console.log(`Password: "${pwd}"`);
    console.log(`  Score: ${result.score}/4`);

    const contextPatterns = result.detectedPatterns.filter(
      (p) => p.type === "context"
    );
    if (contextPatterns.length > 0) {
      console.log(
        `  ⚠️ Contains user info: ${contextPatterns
          .map((p) => p.value)
          .join(", ")}`
      );
    }
    console.log();
  }
}

// ============================================================================
// Example 4: Registration Form Validation
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
}

function validatePassword(
  password: string,
  confirmPassword: string,
  userInputs: string[] = [],
  minimumScore: 0 | 1 | 2 | 3 | 4 = 2
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check password match
  if (password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  // Check minimum length (NIST requirement)
  if (!meetsMinimumRequirements(password)) {
    errors.push(`Password must be at least ${NIST_MIN_LENGTH} characters`);
  }

  // Score the password
  const result = scorePasswordSync(password, { userInputs });

  // Check minimum score
  if (result.score < minimumScore) {
    errors.push(`Password is too weak (${getStrengthLabel(result.score)})`);
  }

  // Add warnings
  if (result.feedback.warning) {
    warnings.push(result.feedback.warning);
  }
  warnings.push(...result.feedback.suggestions);

  // Check recommended length
  if (password.length < NIST_RECOMMENDED_LENGTH) {
    warnings.push(
      `Consider using ${NIST_RECOMMENDED_LENGTH}+ characters for optimal security`
    );
  }

  return {
    isValid: errors.length === 0,
    score: result.score,
    errors,
    warnings,
  };
}

function registrationExample() {
  console.log("=== Registration Form Validation ===\n");

  const testCases = [
    { password: "abc", confirm: "abc" },
    { password: "password123", confirm: "password123" },
    { password: "MySecurePass!", confirm: "MySecurePass!" },
    {
      password: "correct-horse-battery-staple",
      confirm: "correct-horse-battery-staple",
    },
    { password: "xK9#mL2$vP8@nQ5!wB", confirm: "xK9#mL2$vP8@nQ5!wB" },
  ];

  for (const { password, confirm } of testCases) {
    const result = validatePassword(password, confirm, [], 2);
    console.log(`Password: "${password}"`);
    console.log(`  Valid: ${result.isValid ? "✓" : "✗"}`);
    console.log(
      `  Score: ${result.score}/4 (${getStrengthLabel(
        result.score as 0 | 1 | 2 | 3 | 4
      )})`
    );

    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join("; ")}`);
    }
    if (result.warnings.length > 0) {
      console.log(`  Warnings: ${result.warnings.slice(0, 2).join("; ")}`);
    }
    console.log();
  }
}

// ============================================================================
// Example 5: Real-time Strength Meter (UI Component Logic)
// ============================================================================

interface StrengthMeterState {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  percentage: number;
  feedback: string;
}

function getStrengthMeterState(password: string): StrengthMeterState {
  if (password.length === 0) {
    return {
      score: 0,
      label: "Enter a password",
      color: "#9ca3af", // gray
      percentage: 0,
      feedback: "",
    };
  }

  const result = scorePasswordSync(password);

  return {
    score: result.score,
    label: getStrengthLabel(result.score),
    color: getStrengthColor(result.score),
    percentage: ((result.score + 1) / 5) * 100,
    feedback: result.feedback.warning || result.feedback.suggestions[0] || "",
  };
}

function strengthMeterExample() {
  console.log("=== Real-time Strength Meter States ===\n");

  // Simulate typing a password character by character
  const targetPassword = "MySecure@Pass2024";

  console.log("Simulating real-time password entry:\n");

  for (let i = 0; i <= targetPassword.length; i++) {
    const partial = targetPassword.substring(0, i);
    const state = getStrengthMeterState(partial);

    // Visual representation
    const barLength = 20;
    const filledLength = Math.round((state.percentage / 100) * barLength);
    const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);

    console.log(`"${partial || "(empty)"}" → [${bar}] ${state.label}`);
  }
}

// ============================================================================
// Example 6: Pattern Analysis Report
// ============================================================================

function patternAnalysisExample() {
  console.log("\n=== Pattern Analysis Report ===\n");

  const password = "Summer2024!qwerty";
  const result = scorePasswordSync(password);

  console.log(`Analyzing: "${password}"\n`);
  console.log("Detected Patterns:");
  console.log("-".repeat(60));

  if (result.detectedPatterns.length === 0) {
    console.log("No weakness patterns detected");
  } else {
    for (const pattern of result.detectedPatterns) {
      console.log(`Type: ${pattern.type.padEnd(20)} Value: "${pattern.value}"`);
      console.log(`  Position: ${pattern.startIndex}-${pattern.endIndex}`);
      console.log(
        `  Entropy Penalty: ${(pattern.entropyPenalty * 100).toFixed(0)}%`
      );
      console.log();
    }
  }

  console.log("-".repeat(60));
  console.log(
    `Base entropy would be: ~${(result.entropyBits / (1 - 0.5)).toFixed(
      1
    )} bits`
  );
  console.log(`After penalties: ${result.entropyBits} bits`);
  console.log(
    `Final score: ${result.score}/4 (${getStrengthLabel(result.score)})`
  );
}

// ============================================================================
// Example 7: Batch Password Audit
// ============================================================================

interface AuditResult {
  password: string;
  score: number;
  issues: string[];
  recommendation: string;
}

function auditPasswords(passwords: string[]): AuditResult[] {
  return passwords.map((password) => {
    const result = scorePasswordSync(password);

    const issues: string[] = [];

    // Collect all issues
    for (const pattern of result.detectedPatterns) {
      issues.push(
        `Contains ${pattern.type.replace("_", " ")}: "${pattern.value}"`
      );
    }

    if (password.length < NIST_RECOMMENDED_LENGTH) {
      issues.push(
        `Below recommended length (${NIST_RECOMMENDED_LENGTH} chars)`
      );
    }

    // Generate recommendation
    let recommendation: string;
    if (result.score >= 3) {
      recommendation = "Keep this password";
    } else if (result.score === 2) {
      recommendation = "Consider strengthening";
    } else {
      recommendation = "Change immediately";
    }

    return {
      password,
      score: result.score,
      issues,
      recommendation,
    };
  });
}

function batchAuditExample() {
  console.log("\n=== Batch Password Audit ===\n");

  const passwords = [
    "admin123",
    "MyDog$Fluffy",
    "correct horse battery staple",
    "x9K#mL2$",
    "Summer2024",
    "aK9#xL2$mQ8@vP5!nR7&wB3",
  ];

  const results = auditPasswords(passwords);

  // Summary table
  console.log("Password".padEnd(30) + "Score  Recommendation");
  console.log("-".repeat(60));

  for (const r of results) {
    const truncated =
      r.password.length > 25 ? r.password.substring(0, 22) + "..." : r.password;
    console.log(
      truncated.padEnd(30) + `${r.score}/4`.padEnd(7) + r.recommendation
    );
  }

  // Detailed issues
  console.log("\nDetailed Issues:");
  console.log("-".repeat(60));

  for (const r of results) {
    if (r.issues.length > 0) {
      console.log(`"${r.password}":`);
      for (const issue of r.issues) {
        console.log(`  - ${issue}`);
      }
    }
  }
}

// ============================================================================
// Run Examples
// ============================================================================

async function main() {
  basicExample();
  userContextExample();
  registrationExample();
  strengthMeterExample();
  patternAnalysisExample();
  batchAuditExample();

  // Async examples (require network)
  console.log("\n" + "=".repeat(60));
  console.log("The following example requires network access to HIBP API:");
  console.log("=".repeat(60) + "\n");

  await hibpExample();
}

// Export for testing
export { validatePassword, getStrengthMeterState, auditPasswords };

// Run if executed directly
main().catch(console.error);
