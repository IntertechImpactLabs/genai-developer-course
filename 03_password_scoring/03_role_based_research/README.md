# Password Scorer

A research-backed TypeScript password strength evaluator following **2025 NIST SP 800-63B guidelines** and modern security best practices.

## Why This Library?

Traditional password policies (requiring uppercase, lowercase, numbers, symbols) are **proven ineffective** by research. They lead to predictable patterns like `P@ssword1` that look complex but are easily cracked.

This library implements the approach recommended by:

- **NIST SP 800-63B** (2024/2025 draft) - The authoritative U.S. federal standard
- **zxcvbn algorithm** (USENIX Security '16) - Dropbox's research-backed estimator
- **Have I Been Pwned** - Real-world breach data with k-Anonymity privacy

## Key Design Principles

Based on peer-reviewed research:

| Old Approach ❌          | New Approach ✓                     |
| ------------------------ | ---------------------------------- |
| Require complexity rules | Prioritize length (15+ chars)      |
| Force periodic resets    | Only reset on compromise           |
| Password hints allowed   | No hints (social engineering risk) |
| Theoretical entropy      | Real-world pattern detection       |

## Installation

```bash
npm install password-scorer
```

## Quick Start

```typescript
import { scorePassword, scorePasswordSync } from "password-scorer";

// Synchronous (no breach check)
const result = scorePasswordSync("MyPassword123!");
console.log(result.score); // 0-4 scale
console.log(result.entropyBits); // Estimated entropy
console.log(result.feedback); // Actionable suggestions

// Async with Have I Been Pwned check
const result = await scorePassword("password123", { checkHibp: true });
console.log(result.isCompromised); // true - seen in breaches!
console.log(result.breachCount); // 123456+ times
```

## Score Scale

The scoring follows the research-proven zxcvbn scale:

| Score | Label       | Guesses | Protection Level           |
| ----- | ----------- | ------- | -------------------------- |
| 0     | Very Weak   | < 10³   | None - easily guessed      |
| 1     | Weak        | < 10⁶   | Throttled online attacks   |
| 2     | Fair        | < 10⁸   | Unthrottled online attacks |
| 3     | Strong      | < 10¹⁰  | Offline slow-hash attacks  |
| 4     | Very Strong | ≥ 10¹⁰  | Offline fast-hash attacks  |

## API Reference

### `scorePassword(password, options?)`

Async function with optional Have I Been Pwned check.

```typescript
const result = await scorePassword("mypassword", {
  checkHibp: true, // Check against breach databases
  userInputs: ["john", "example.com"], // Penalize personal info
  customDictionary: ["acme", "corp"], // Add domain-specific words
});
```

### `scorePasswordSync(password, options?)`

Synchronous version without HIBP check.

```typescript
const result = scorePasswordSync("mypassword", {
  userInputs: ["username"],
});
```

### Return Type: `PasswordScore`

```typescript
interface PasswordScore {
  score: 0 | 1 | 2 | 3 | 4;
  entropyBits: number;
  guesses: number;
  guessesLog10: number;
  crackTimes: {
    onlineThrottled: number; // 100/hour
    onlineUnthrottled: number; // 10/second
    offlineSlowHash: number; // 10k/s (bcrypt)
    offlineFastHash: number; // 10B/s (MD5)
  };
  crackTimesDisplay: {
    onlineThrottled: string; // "3 hours"
    onlineUnthrottled: string;
    offlineSlowHash: string;
    offlineFastHash: string;
  };
  feedback: {
    warning: string;
    suggestions: string[];
  };
  detectedPatterns: DetectedPattern[];
  isCompromised?: boolean; // If HIBP checked
  breachCount?: number;
  nistCompliance: {
    meetsMinimumLength: boolean; // ≥8 chars
    meetsRecommendedLength: boolean; // ≥15 chars
    notCompromised: boolean | null;
    compliant: boolean;
  };
}
```

## Pattern Detection

The library detects and penalizes:

| Pattern           | Example              | Penalty       |
| ----------------- | -------------------- | ------------- |
| Common passwords  | `password`, `123456` | Severe (~90%) |
| Dictionary words  | `summer`, `dragon`   | High (~40%)   |
| Keyboard patterns | `qwerty`, `asdfgh`   | High (~50%)   |
| Sequences         | `abcdef`, `123456`   | Medium (~40%) |
| Repeats           | `aaaa`, `abcabc`     | Medium (~50%) |
| Dates             | `2024`, `01/15/1990` | Medium (~35%) |
| L33t speak        | `p@ssw0rd`           | High (~60%)   |
| User context      | Username, email      | High (~60%)   |

## Usage Examples

### Registration Form

```typescript
function validatePassword(password: string, username: string): boolean {
  const result = scorePasswordSync(password, {
    userInputs: [username],
  });

  // NIST requires 8+ chars, we recommend score ≥2
  if (!result.nistCompliance.meetsMinimumLength) {
    throw new Error("Password must be at least 8 characters");
  }

  if (result.score < 2) {
    throw new Error(result.feedback.warning || "Password too weak");
  }

  return true;
}
```

### Real-Time Strength Meter

```typescript
function getStrengthMeter(password: string) {
  const result = scorePasswordSync(password);

  return {
    percentage: ((result.score + 1) / 5) * 100,
    label: getStrengthLabel(result.score),
    color: getStrengthColor(result.score),
    hint: result.feedback.suggestions[0],
  };
}
```

### With Have I Been Pwned

```typescript
async function checkPassword(password: string) {
  const result = await scorePassword(password, { checkHibp: true });

  if (result.isCompromised) {
    console.warn(`Password found in ${result.breachCount} breaches!`);
    return false;
  }

  return result.score >= 2;
}
```

## NIST 2025 Guidelines Summary

This library implements NIST SP 800-63B recommendations:

✅ **Minimum 8 characters** (SHALL requirement)  
✅ **Recommended 15+ characters** (SHOULD recommendation)  
✅ **Support up to 64+ characters**  
✅ **Allow all ASCII and Unicode characters**  
✅ **Allow spaces** (enables passphrases)  
✅ **Check against compromised password lists**  
✅ **No complexity composition rules**  
✅ **No mandatory periodic resets**  
✅ **No password hints or security questions**

## Technical Notes

### Entropy Calculation

Base entropy uses: `E = L × log₂(N)`

Where:

- `L` = password length
- `N` = character pool size (26-94+ depending on character types)

Entropy is then reduced based on detected patterns.

### HIBP Integration

Uses k-Anonymity model for privacy:

1. SHA-1 hash the password locally
2. Send only first 5 characters of hash
3. Receive all matching suffixes (~500-800)
4. Check locally if full hash matches

**Your password is never transmitted.**

### Crack Time Assumptions

| Scenario           | Speed    | Use Case             |
| ------------------ | -------- | -------------------- |
| Online throttled   | 100/hour | Well-protected login |
| Online unthrottled | 10/sec   | Weak rate limiting   |
| Offline slow hash  | 10k/sec  | bcrypt, Argon2       |
| Offline fast hash  | 10B/sec  | MD5, SHA-1 (leaked)  |

## References

- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html) - Digital Identity Guidelines
- [zxcvbn Paper](https://www.usenix.org/conference/usenixsecurity16/technical-sessions/presentation/wheeler) - USENIX Security '16
- [Have I Been Pwned](https://haveibeenpwned.com/API/v3) - Pwned Passwords API
- [XKCD 936](https://xkcd.com/936/) - Password Strength comic

## License

MIT
