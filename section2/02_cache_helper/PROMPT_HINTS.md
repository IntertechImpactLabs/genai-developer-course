# Prompt Hints for Cache Implementation

## Before Writing Your Prompt

Look at the test file and identify:
1. What methods are being tested?
2. What parameters do they accept?
3. What do they return?
4. What edge cases are covered?

## Key Technical Details to Consider

### TypeScript Specifics
- The cache is **generic**: `Cache<T>` means it can store any type
- Methods have specific return types (check the stub!)
- TypeScript has built-in timer functions

### Timer Management
- JavaScript/TypeScript uses `setTimeout` for delays
- Timers return IDs that can be cleared with `clearTimeout`
- When should timers be cleared? (hint: delete, clear, overwrite)

### Data Storage
- What data structure holds the cache items?
- If using TTL, do you need to store expiration info?
- How do you track active timers?

## Building Your Prompt

### Essential Elements
1. **Language**: TypeScript (be explicit!)
2. **Purpose**: What is a cache for?
3. **Methods**: List each method and what it should do
4. **TTL behavior**: How should expiration work?
5. **Edge cases**: What about overwriting keys with TTL?

### Common Issues and Solutions

**Tests failing with "undefined is not a function"?**
- Did you initialize the data structures in the constructor?

**TTL tests failing?**
- Did you mention using `setTimeout` for expiration?
- Are you clearing timers when needed?

**Size not updating correctly?**
- Are you tracking when items are added/removed?
- What about expired items?

**Type errors?**
- Did you specify the cache should be generic?
- Check the return types match the stub

## Debugging Test Failures

When a test fails:
1. Read the test name - it tells you what feature is broken
2. Look at the assertion that failed
3. Add that specific requirement to your prompt

Examples:
- `"should expire items after TTL"` fails → Mention automatic expiration with setTimeout
- `"should clean up timers"` fails → Specify clearing timers on delete/clear
- `"should return false for expired keys"` fails → Clarify has() behavior with expired items

## Prompt Structure Template

Fill in the blanks:
```
Language: TypeScript

Task: Create a generic in-memory cache class

Requirements:
- Generic type support: Cache<T> can store ___
- Storage: Use ___ to store key-value pairs
- TTL: Use ___ for automatic expiration after specified milliseconds
- Methods:
  - set(key, value, ttl?): ___
  - get(key): returns ___ if not found
  - has(key): returns ___
  - delete(key): returns ___
  - clear(): ___
  - size(): ___
- Timer cleanup: Clear timers when ___
```

## Things the AI Might Miss

Without specific instructions, AI often forgets:
1. Cleaning up timers when deleting/clearing
2. Handling the case of overwriting a key that has a timer
3. Making `size()` account for expired items
4. Returning correct boolean values from `delete()`

## Remember

Each iteration teaches you:
- What level of detail produces working code
- What assumptions AI makes
- How to read tests to extract requirements
- How to translate test failures into prompt improvements

Good luck! Focus on learning what makes prompts effective.