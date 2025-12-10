/**
 * Password Scoring Utility
 *
 * A research-backed password strength evaluator following 2025 NIST SP 800-63B guidelines.
 *
 * Design Principles (based on research):
 * 1. Length over complexity - NIST recommends 15+ characters, minimum 8
 * 2. No arbitrary complexity rules - research shows they lead to predictable patterns
 * 3. Check against compromised passwords - mandatory per NIST
 * 4. Pattern detection - keyboard patterns, sequences, repeats, dictionary words
 * 5. Entropy calculation - estimate guesses needed to crack
 *
 * References:
 * - NIST SP 800-63B (2024 draft)
 * - zxcvbn algorithm (USENIX Security '16)
 * - Have I Been Pwned API (k-anonymity model)
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Generated on claude.ai using Opus 4.5.
 *
 * Prompt:
 * Act as a cybersecurity architect to design a TypeScript password scoring utility function.
 * Follow best practices for 2025 based on facts proven by research.
 */
export interface PasswordScore {
  /** Overall score 0-4 (matches zxcvbn scale) */
  score: 0 | 1 | 2 | 3 | 4;

  /** Estimated entropy in bits */
  entropyBits: number;

  /** Estimated number of guesses to crack */
  guesses: number;

  /** Log10 of guesses (useful for comparisons) */
  guessesLog10: number;

  /** Estimated crack times for different attack scenarios */
  crackTimes: CrackTimeEstimates;

  /** Human-readable crack times */
  crackTimesDisplay: CrackTimeDisplay;

  /** Feedback for improving the password */
  feedback: PasswordFeedback;

  /** Detected patterns that weaken the password */
  detectedPatterns: DetectedPattern[];

  /** Whether password appears in known breach databases (if checked) */
  isCompromised?: boolean;

  /** Number of times seen in breaches (if checked) */
  breachCount?: number;

  /** NIST compliance status */
  nistCompliance: NistCompliance;
}

export interface CrackTimeEstimates {
  /** Online attack, throttled (100/hour) */
  onlineThrottled: number;
  /** Online attack, no throttling (10/second) */
  onlineUnthrottled: number;
  /** Offline attack with slow hash like bcrypt (10k/second) */
  offlineSlowHash: number;
  /** Offline attack with fast hash like MD5 (10B/second) */
  offlineFastHash: number;
}

export interface CrackTimeDisplay {
  onlineThrottled: string;
  onlineUnthrottled: string;
  offlineSlowHash: string;
  offlineFastHash: string;
}

export interface PasswordFeedback {
  /** Warning about specific weakness */
  warning: string;
  /** Actionable suggestions */
  suggestions: string[];
}

export interface DetectedPattern {
  type: PatternType;
  value: string;
  startIndex: number;
  endIndex: number;
  entropyPenalty: number;
}

export type PatternType =
  | "dictionary"
  | "common_password"
  | "keyboard_pattern"
  | "sequence"
  | "repeat"
  | "date"
  | "l33t"
  | "reversed"
  | "context";

export interface NistCompliance {
  /** Meets minimum length (8 chars) */
  meetsMinimumLength: boolean;
  /** Meets recommended length (15 chars) */
  meetsRecommendedLength: boolean;
  /** Does not appear in compromised lists */
  notCompromised: boolean | null;
  /** Overall compliance status */
  compliant: boolean;
}

export interface ScoringOptions {
  /** User-specific data to penalize (username, email, site name) */
  userInputs?: string[];
  /** Check against Have I Been Pwned API */
  checkHibp?: boolean;
  /** Custom dictionary words to check against */
  customDictionary?: string[];
  /** Minimum acceptable score (0-4) */
  minimumScore?: 0 | 1 | 2 | 3 | 4;
}

// ============================================================================
// Constants
// ============================================================================

/** NIST-recommended minimum password length */
const NIST_MIN_LENGTH = 8;

/** NIST-recommended optimal password length */
const NIST_RECOMMENDED_LENGTH = 15;

/** Maximum recommended length to support */
const MAX_SUPPORTED_LENGTH = 64;

/** Character set sizes for entropy calculation */
const CHAR_SETS = {
  lowercase: 26,
  uppercase: 26,
  digits: 10,
  symbols: 33, // Common ASCII symbols
  space: 1,
  unicode: 100, // Conservative estimate for extended chars
} as const;

/** Attack speed assumptions (guesses per second) */
const ATTACK_SPEEDS = {
  onlineThrottled: 100 / 3600, // 100 per hour
  onlineUnthrottled: 10,
  offlineSlowHash: 1e4, // 10k/s (bcrypt, argon2)
  offlineFastHash: 1e10, // 10B/s (MD5, SHA1)
} as const;

/** Score thresholds based on guesses (zxcvbn scale) */
const SCORE_THRESHOLDS = {
  0: 1e3, // < 1000 guesses: too guessable
  1: 1e6, // < 10^6: very guessable
  2: 1e8, // < 10^8: somewhat guessable
  3: 1e10, // < 10^10: safely unguessable
  // 4: >= 10^10: very unguessable
} as const;

// Common passwords (top 1000 - abbreviated for demonstration)
const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "1234567",
  "letmein",
  "trustno1",
  "dragon",
  "baseball",
  "iloveyou",
  "master",
  "sunshine",
  "ashley",
  "fuckme",
  "bailey",
  "shadow",
  "123123",
  "654321",
  "superman",
  "qazwsx",
  "michael",
  "football",
  "password1",
  "password123",
  "batman",
  "login",
  "admin",
  "welcome",
  "hello",
  "charlie",
  "donald",
  "passw0rd",
  "qwerty123",
  "admin123",
  "root",
  "toor",
  "pass",
  "test",
  "guest",
  "master123",
  "changeme",
  "p@ssw0rd",
  "p@ssword",
  "123456789",
  "12345",
  "1234567890",
  "0987654321",
  "password!",
  "password1!",
  "letmein123",
]);

// Common English words for dictionary detection
const DICTIONARY_WORDS = new Set([
  "love",
  "hate",
  "life",
  "death",
  "time",
  "year",
  "people",
  "way",
  "day",
  "man",
  "woman",
  "child",
  "world",
  "school",
  "state",
  "family",
  "student",
  "group",
  "country",
  "problem",
  "hand",
  "part",
  "place",
  "case",
  "week",
  "company",
  "system",
  "program",
  "question",
  "work",
  "government",
  "number",
  "night",
  "point",
  "home",
  "water",
  "room",
  "mother",
  "area",
  "money",
  "story",
  "fact",
  "month",
  "lot",
  "right",
  "study",
  "book",
  "eye",
  "job",
  "word",
  "business",
  "issue",
  "side",
  "kind",
  "head",
  "house",
  "service",
  "friend",
  "father",
  "power",
  "hour",
  "game",
  "line",
  "end",
  "member",
  "law",
  "car",
  "city",
  "community",
  "name",
  "president",
  "team",
  "minute",
  "idea",
  "kid",
  "body",
  "information",
  "back",
  "parent",
  "face",
  "others",
  "level",
  "office",
  "door",
  "health",
  "person",
  "art",
  "war",
  "history",
  "party",
  "result",
  "change",
  "morning",
  "reason",
  "research",
  "girl",
  "guy",
  "moment",
  "air",
  "teacher",
  "force",
  "education",
  "summer",
  "winter",
  "spring",
  "fall",
  "autumn",
]);

// Keyboard patterns (QWERTY layout)
const KEYBOARD_PATTERNS = [
  "qwerty",
  "qwertyuiop",
  "asdf",
  "asdfgh",
  "asdfghjkl",
  "zxcv",
  "zxcvbn",
  "qazwsx",
  "qweasdzxc",
  "1qaz2wsx",
  "zaq12wsx",
  "qweasd",
  "asdzxc",
  "!@#$%",
  "!@#$%^",
  "!@#$%^&",
  "!@#$%^&*",
  "1234qwer",
  "qwer1234",
  "poiuy",
  "poiuyt",
  "lkjhg",
  "lkjhgf",
  "mnbvc",
  "mnbvcx",
];

// L33t speak substitutions
const L33T_MAP: Record<string, string[]> = {
  a: ["4", "@"],
  b: ["8"],
  c: ["(", "{", "["],
  e: ["3"],
  g: ["9", "6"],
  i: ["1", "!", "|"],
  l: ["1", "|"],
  o: ["0"],
  s: ["$", "5"],
  t: ["7", "+"],
  z: ["2"],
};

// ============================================================================
// Core Scoring Function
// ============================================================================

/**
 * Scores a password based on research-backed criteria.
 *
 * @param password - The password to evaluate
 * @param options - Scoring configuration options
 * @returns Comprehensive password score and feedback
 */
export async function scorePassword(
  password: string,
  options: ScoringOptions = {}
): Promise<PasswordScore> {
  const { userInputs = [], checkHibp = false, customDictionary = [] } = options;

  // Detect all patterns
  const patterns = detectAllPatterns(password, userInputs, customDictionary);

  // Calculate base entropy
  const baseEntropy = calculateBaseEntropy(password);

  // Apply pattern penalties
  const adjustedEntropy = applyPatternPenalties(
    baseEntropy,
    patterns,
    password
  );

  // Estimate guesses
  const guesses = Math.pow(2, adjustedEntropy);
  const guessesLog10 = adjustedEntropy * Math.log10(2);

  // Calculate score (0-4)
  const score = calculateScore(guesses);

  // Calculate crack times
  const crackTimes = calculateCrackTimes(guesses);
  const crackTimesDisplay = formatCrackTimes(crackTimes);

  // Generate feedback
  const feedback = generateFeedback(password, patterns, score);

  // Check HIBP if requested
  let isCompromised: boolean | undefined;
  let breachCount: number | undefined;

  if (checkHibp) {
    const hibpResult = await checkHaveIBeenPwned(password);
    isCompromised = hibpResult.compromised;
    breachCount = hibpResult.count;
  }

  // Assess NIST compliance
  const nistCompliance = assessNistCompliance(password, isCompromised);

  return {
    score,
    entropyBits: Math.round(adjustedEntropy * 100) / 100,
    guesses: Math.round(guesses),
    guessesLog10: Math.round(guessesLog10 * 100) / 100,
    crackTimes,
    crackTimesDisplay,
    feedback,
    detectedPatterns: patterns,
    isCompromised,
    breachCount,
    nistCompliance,
  };
}

/**
 * Synchronous version without HIBP check
 */
export function scorePasswordSync(
  password: string,
  options: Omit<ScoringOptions, "checkHibp"> = {}
): Omit<PasswordScore, "isCompromised" | "breachCount"> {
  const { userInputs = [], customDictionary = [] } = options;

  const patterns = detectAllPatterns(password, userInputs, customDictionary);
  const baseEntropy = calculateBaseEntropy(password);
  const adjustedEntropy = applyPatternPenalties(
    baseEntropy,
    patterns,
    password
  );
  const guesses = Math.pow(2, adjustedEntropy);
  const guessesLog10 = adjustedEntropy * Math.log10(2);
  const score = calculateScore(guesses);
  const crackTimes = calculateCrackTimes(guesses);
  const crackTimesDisplay = formatCrackTimes(crackTimes);
  const feedback = generateFeedback(password, patterns, score);
  const nistCompliance = assessNistCompliance(password, undefined);

  return {
    score,
    entropyBits: Math.round(adjustedEntropy * 100) / 100,
    guesses: Math.round(guesses),
    guessesLog10: Math.round(guessesLog10 * 100) / 100,
    crackTimes,
    crackTimesDisplay,
    feedback,
    detectedPatterns: patterns,
    nistCompliance,
  };
}

// ============================================================================
// Pattern Detection
// ============================================================================

function detectAllPatterns(
  password: string,
  userInputs: string[],
  customDictionary: string[]
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const lower = password.toLowerCase();

  // Check for common passwords
  if (COMMON_PASSWORDS.has(lower)) {
    patterns.push({
      type: "common_password",
      value: password,
      startIndex: 0,
      endIndex: password.length - 1,
      entropyPenalty: 0.9, // Severe penalty
    });
  }

  // Check for dictionary words
  patterns.push(...detectDictionaryWords(password, customDictionary));

  // Check for keyboard patterns
  patterns.push(...detectKeyboardPatterns(password));

  // Check for sequences
  patterns.push(...detectSequences(password));

  // Check for repeats
  patterns.push(...detectRepeats(password));

  // Check for dates
  patterns.push(...detectDates(password));

  // Check for l33t speak
  patterns.push(...detectL33t(password));

  // Check for user context (username, email, etc.)
  patterns.push(...detectUserContext(password, userInputs));

  return patterns;
}

function detectDictionaryWords(
  password: string,
  customDictionary: string[]
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const lower = password.toLowerCase();

  // Check against built-in dictionary
  const allWords = [
    ...DICTIONARY_WORDS,
    ...customDictionary.map((w) => w.toLowerCase()),
  ];

  for (const word of allWords) {
    if (word.length < 4) continue; // Skip very short words

    const index = lower.indexOf(word);
    if (index !== -1) {
      patterns.push({
        type: "dictionary",
        value: word,
        startIndex: index,
        endIndex: index + word.length - 1,
        entropyPenalty: 0.3 + (word.length / password.length) * 0.2,
      });
    }

    // Check reversed
    const reversed = word.split("").reverse().join("");
    const revIndex = lower.indexOf(reversed);
    if (revIndex !== -1) {
      patterns.push({
        type: "reversed",
        value: reversed,
        startIndex: revIndex,
        endIndex: revIndex + reversed.length - 1,
        entropyPenalty: 0.25,
      });
    }
  }

  return patterns;
}

function detectKeyboardPatterns(password: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const lower = password.toLowerCase();

  for (const pattern of KEYBOARD_PATTERNS) {
    const index = lower.indexOf(pattern);
    if (index !== -1) {
      patterns.push({
        type: "keyboard_pattern",
        value: pattern,
        startIndex: index,
        endIndex: index + pattern.length - 1,
        entropyPenalty: 0.4 + (pattern.length / password.length) * 0.3,
      });
    }
  }

  return patterns;
}

function detectSequences(password: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Detect ascending/descending sequences
  let seqStart = 0;
  let seqLength = 1;
  let isAscending = true;

  for (let i = 1; i < password.length; i++) {
    const diff = password.charCodeAt(i) - password.charCodeAt(i - 1);

    if (Math.abs(diff) === 1) {
      if (seqLength === 1) {
        isAscending = diff === 1;
        seqLength++;
      } else if ((diff === 1) === isAscending) {
        seqLength++;
      } else {
        if (seqLength >= 3) {
          patterns.push({
            type: "sequence",
            value: password.substring(seqStart, seqStart + seqLength),
            startIndex: seqStart,
            endIndex: seqStart + seqLength - 1,
            entropyPenalty: 0.3 + (seqLength / password.length) * 0.2,
          });
        }
        seqStart = i - 1;
        seqLength = 2;
        isAscending = diff === 1;
      }
    } else {
      if (seqLength >= 3) {
        patterns.push({
          type: "sequence",
          value: password.substring(seqStart, seqStart + seqLength),
          startIndex: seqStart,
          endIndex: seqStart + seqLength - 1,
          entropyPenalty: 0.3 + (seqLength / password.length) * 0.2,
        });
      }
      seqStart = i;
      seqLength = 1;
    }
  }

  // Check final sequence
  if (seqLength >= 3) {
    patterns.push({
      type: "sequence",
      value: password.substring(seqStart, seqStart + seqLength),
      startIndex: seqStart,
      endIndex: seqStart + seqLength - 1,
      entropyPenalty: 0.3 + (seqLength / password.length) * 0.2,
    });
  }

  return patterns;
}

function detectRepeats(password: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Detect character repeats (aaa, 111)
  const repeatRegex = /(.)\1{2,}/g;
  let match;

  while ((match = repeatRegex.exec(password)) !== null) {
    patterns.push({
      type: "repeat",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length - 1,
      entropyPenalty: 0.4 + (match[0].length / password.length) * 0.3,
    });
  }

  // Detect pattern repeats (abcabc)
  for (let len = 2; len <= password.length / 2; len++) {
    for (let start = 0; start <= password.length - len * 2; start++) {
      const pattern = password.substring(start, start + len);
      const rest = password.substring(start + len);

      if (rest.startsWith(pattern)) {
        let repeatCount = 1;
        let pos = 0;

        while (rest.substring(pos).startsWith(pattern)) {
          repeatCount++;
          pos += len;
        }

        if (repeatCount >= 2) {
          patterns.push({
            type: "repeat",
            value: pattern.repeat(repeatCount),
            startIndex: start,
            endIndex: start + len * repeatCount - 1,
            entropyPenalty: 0.5,
          });
        }
      }
    }
  }

  return patterns;
}

function detectDates(password: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Common date patterns
  const datePatterns = [
    /\b(19|20)\d{2}\b/g, // Years 1900-2099
    /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g, // Various date formats
    /\b\d{8}\b/g, // YYYYMMDD or MMDDYYYY
    /\b\d{6}\b/g, // YYMMDD or MMDDYY
  ];

  for (const regex of datePatterns) {
    let match;
    while ((match = regex.exec(password)) !== null) {
      patterns.push({
        type: "date",
        value: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length - 1,
        entropyPenalty: 0.35,
      });
    }
  }

  return patterns;
}

function detectL33t(password: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Convert l33t to regular text
  let decoded = password.toLowerCase();
  let hasL33t = false;

  for (const [letter, substitutes] of Object.entries(L33T_MAP)) {
    for (const sub of substitutes) {
      if (decoded.includes(sub)) {
        decoded = decoded.split(sub).join(letter);
        hasL33t = true;
      }
    }
  }

  if (hasL33t && decoded !== password.toLowerCase()) {
    // Check if decoded version is a common word/password
    if (COMMON_PASSWORDS.has(decoded) || DICTIONARY_WORDS.has(decoded)) {
      patterns.push({
        type: "l33t",
        value: `${password} -> ${decoded}`,
        startIndex: 0,
        endIndex: password.length - 1,
        entropyPenalty: 0.6,
      });
    }
  }

  return patterns;
}

function detectUserContext(
  password: string,
  userInputs: string[]
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const lower = password.toLowerCase();

  for (const input of userInputs) {
    const inputLower = input.toLowerCase();

    if (inputLower.length < 3) continue;

    const index = lower.indexOf(inputLower);
    if (index !== -1) {
      patterns.push({
        type: "context",
        value: input,
        startIndex: index,
        endIndex: index + input.length - 1,
        entropyPenalty: 0.5 + (input.length / password.length) * 0.3,
      });
    }
  }

  return patterns;
}

// ============================================================================
// Entropy Calculation
// ============================================================================

function calculateBaseEntropy(password: string): number {
  if (password.length === 0) return 0;

  // Determine character pool size
  let poolSize = 0;

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const hasSpace = / /.test(password);
  const hasUnicode = /[^\x00-\x7F]/.test(password);

  if (hasLowercase) poolSize += CHAR_SETS.lowercase;
  if (hasUppercase) poolSize += CHAR_SETS.uppercase;
  if (hasDigits) poolSize += CHAR_SETS.digits;
  if (hasSymbols) poolSize += CHAR_SETS.symbols;
  if (hasSpace) poolSize += CHAR_SETS.space;
  if (hasUnicode) poolSize += CHAR_SETS.unicode;

  // Minimum pool size
  poolSize = Math.max(poolSize, 10);

  // Entropy = length * log2(poolSize)
  return password.length * Math.log2(poolSize);
}

function applyPatternPenalties(
  baseEntropy: number,
  patterns: DetectedPattern[],
  password: string
): number {
  if (patterns.length === 0) return baseEntropy;

  // Calculate total penalty (capped at 0.95 to avoid complete zeroing)
  const totalPenalty = Math.min(
    0.95,
    patterns.reduce((sum, p) => sum + p.entropyPenalty, 0)
  );

  // Special case: if it's a common password, severely reduce entropy
  const isCommonPassword = patterns.some((p) => p.type === "common_password");
  if (isCommonPassword) {
    return Math.min(baseEntropy * 0.1, 10);
  }

  return baseEntropy * (1 - totalPenalty);
}

// ============================================================================
// Score Calculation
// ============================================================================

function calculateScore(guesses: number): 0 | 1 | 2 | 3 | 4 {
  if (guesses < SCORE_THRESHOLDS[0]) return 0;
  if (guesses < SCORE_THRESHOLDS[1]) return 1;
  if (guesses < SCORE_THRESHOLDS[2]) return 2;
  if (guesses < SCORE_THRESHOLDS[3]) return 3;
  return 4;
}

function calculateCrackTimes(guesses: number): CrackTimeEstimates {
  return {
    onlineThrottled: guesses / ATTACK_SPEEDS.onlineThrottled,
    onlineUnthrottled: guesses / ATTACK_SPEEDS.onlineUnthrottled,
    offlineSlowHash: guesses / ATTACK_SPEEDS.offlineSlowHash,
    offlineFastHash: guesses / ATTACK_SPEEDS.offlineFastHash,
  };
}

function formatCrackTimes(times: CrackTimeEstimates): CrackTimeDisplay {
  return {
    onlineThrottled: formatDuration(times.onlineThrottled),
    onlineUnthrottled: formatDuration(times.onlineUnthrottled),
    offlineSlowHash: formatDuration(times.offlineSlowHash),
    offlineFastHash: formatDuration(times.offlineFastHash),
  };
}

function formatDuration(seconds: number): string {
  if (seconds < 1) return "instant";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  return "centuries";
}

// ============================================================================
// Feedback Generation
// ============================================================================

function generateFeedback(
  password: string,
  patterns: DetectedPattern[],
  score: number
): PasswordFeedback {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Length-based feedback
  if (password.length < NIST_MIN_LENGTH) {
    warnings.push(`Password must be at least ${NIST_MIN_LENGTH} characters.`);
    suggestions.push(
      `Add ${NIST_MIN_LENGTH - password.length} more characters.`
    );
  } else if (password.length < NIST_RECOMMENDED_LENGTH) {
    suggestions.push(
      `Consider using ${NIST_RECOMMENDED_LENGTH}+ characters for better security.`
    );
  }

  // Pattern-based feedback
  for (const pattern of patterns) {
    switch (pattern.type) {
      case "common_password":
        warnings.push("This is a commonly used password.");
        suggestions.push(
          "Use a unique password that's not on common password lists."
        );
        break;
      case "dictionary":
        warnings.push(`Contains common word: "${pattern.value}".`);
        suggestions.push("Avoid dictionary words or combine unrelated words.");
        break;
      case "keyboard_pattern":
        warnings.push(`Contains keyboard pattern: "${pattern.value}".`);
        suggestions.push('Avoid keyboard patterns like "qwerty" or "asdf".');
        break;
      case "sequence":
        warnings.push(`Contains sequential characters: "${pattern.value}".`);
        suggestions.push('Avoid sequences like "abc" or "123".');
        break;
      case "repeat":
        warnings.push("Contains repeated characters or patterns.");
        suggestions.push("Avoid repeating the same characters.");
        break;
      case "date":
        warnings.push("Contains what looks like a date.");
        suggestions.push(
          "Avoid dates that could be guessed (birthdays, anniversaries)."
        );
        break;
      case "l33t":
        warnings.push(
          "Simple character substitutions don't add much security."
        );
        suggestions.push(
          "Use random characters instead of predictable substitutions."
        );
        break;
      case "context":
        warnings.push("Contains personal information.");
        suggestions.push(
          "Avoid using your name, email, or other personal info."
        );
        break;
    }
  }

  // General suggestions for weak passwords
  if (score <= 2 && suggestions.length === 0) {
    suggestions.push("Use a passphrase: combine 4+ random, unrelated words.");
    suggestions.push(
      "Consider using a password manager to generate and store strong passwords."
    );
  }

  // Remove duplicates
  const uniqueWarnings = [...new Set(warnings)];
  const uniqueSuggestions = [...new Set(suggestions)];

  return {
    warning: uniqueWarnings[0] || "",
    suggestions: uniqueSuggestions.slice(0, 3),
  };
}

// ============================================================================
// NIST Compliance Check
// ============================================================================

function assessNistCompliance(
  password: string,
  isCompromised: boolean | undefined
): NistCompliance {
  const meetsMinimumLength = password.length >= NIST_MIN_LENGTH;
  const meetsRecommendedLength = password.length >= NIST_RECOMMENDED_LENGTH;
  const notCompromised = isCompromised === undefined ? null : !isCompromised;

  // NIST compliance requires minimum length and not being compromised
  const compliant =
    meetsMinimumLength && (notCompromised === null || notCompromised);

  return {
    meetsMinimumLength,
    meetsRecommendedLength,
    notCompromised,
    compliant,
  };
}

// ============================================================================
// Have I Been Pwned Integration (k-Anonymity)
// ============================================================================

interface HibpResult {
  compromised: boolean;
  count: number;
}

/**
 * Checks password against Have I Been Pwned using k-Anonymity.
 * Only sends first 5 chars of SHA-1 hash - the full password is never transmitted.
 */
async function checkHaveIBeenPwned(password: string): Promise<HibpResult> {
  try {
    // Create SHA-1 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

    // k-Anonymity: only send first 5 characters
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    // Query HIBP API
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "Add-Padding": "true", // Enhanced privacy
        },
      }
    );

    if (!response.ok) {
      console.warn("HIBP API request failed:", response.status);
      return { compromised: false, count: 0 };
    }

    const text = await response.text();
    const lines = text.split("\n");

    // Search for our suffix in the response
    for (const line of lines) {
      const parts = line.split(":");
      const hashSuffix = parts[0]?.trim();
      const countStr = parts[1]?.trim() ?? "0";
      if (hashSuffix === suffix) {
        const count = parseInt(countStr, 10);
        return { compromised: count > 0, count };
      }
    }

    return { compromised: false, count: 0 };
  } catch (error) {
    console.warn("HIBP check failed:", error);
    return { compromised: false, count: 0 };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Quick check if password meets minimum requirements
 */
export function meetsMinimumRequirements(password: string): boolean {
  return password.length >= NIST_MIN_LENGTH;
}

/**
 * Generate a strength label from score
 */
export function getStrengthLabel(score: 0 | 1 | 2 | 3 | 4): string {
  const labels: Record<0 | 1 | 2 | 3 | 4, string> = {
    0: "Very Weak",
    1: "Weak",
    2: "Fair",
    3: "Strong",
    4: "Very Strong",
  };
  return labels[score];
}

/**
 * Get color for visual feedback
 */
export function getStrengthColor(score: 0 | 1 | 2 | 3 | 4): string {
  const colors: Record<0 | 1 | 2 | 3 | 4, string> = {
    0: "#dc2626", // red
    1: "#ea580c", // orange
    2: "#ca8a04", // yellow
    3: "#16a34a", // green
    4: "#059669", // emerald
  };
  return colors[score];
}

// ============================================================================
// Exports
// ============================================================================

export default scorePassword;

export {
  NIST_MIN_LENGTH,
  NIST_RECOMMENDED_LENGTH,
  MAX_SUPPORTED_LENGTH,
  checkHaveIBeenPwned,
};
