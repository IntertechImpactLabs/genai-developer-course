# Cache Helper Exercise

## Section 2 Part A: Focused Prompt Design

### Overview
Practice writing specific, focused prompts by generating a simple in-memory cache helper in TypeScript.

### Exercise Goals
- Learn what details to include in technical prompts
- Discover how specificity affects code generation quality  
- Practice iterative refinement based on test feedback

### Time: 30 minutes

### Setup (2 min)

```bash
# Install dependencies
npm install

# Run tests to see what you need to implement
npm test
```

### Instructions

#### 1. Analyze Requirements (5 min)
- Look at `src/cache.ts` - it has a stub with method signatures
- Run `npm test` to see what the tests expect
- Read the test file to understand the requirements:
  - What methods need to work?
  - How should TTL (time-to-live) behave?
  - What edge cases are tested?

#### 2. Write Your Prompt (5 min)
Think about what your AI tool needs to know:
- Language and type system?
- Data structure requirements?
- Timer/expiration behavior?
- What should methods return?

Start with this template and fill in the specifics:
```
Language: TypeScript
Task: [describe what you're building]
Requirements:
- [look at the tests to determine requirements]
- [be specific about behavior]
```

#### 3. Generate Implementation (10 min)
- Use your prompt with your AI tool (GitHub Copilot, Claude, ChatGPT, etc.)
- Replace the stub implementation in `src/cache.ts`
- Review the generated code - does it make sense?

#### 4. Test and Debug (5 min)
```bash
npm test
```
- Which tests pass? Which fail?
- What was missing from your prompt?
- What assumptions did the AI make?

#### 5. Refine (3 min)
- Pick ONE specific failing test
- Add details to your prompt to fix it
- Regenerate and test again

### What You're Building

A generic cache class that:
- Stores key-value pairs of any type
- Supports optional TTL (auto-expiration)
- Tracks cache size
- Can check if keys exist
- Properly cleans up timers

### Prompt Writing Tips

Consider including:
- **Data structures**: What should store the cache data?
- **Timer management**: How to handle TTL expiration?
- **Type safety**: The cache is generic (`Cache<T>`)
- **Return values**: What should `get()` return for missing keys?
- **Edge cases**: Overwriting keys with TTL, clearing timers, etc.

### Testing

```bash
npm test           # Run all tests
npm test -- --watch # Watch mode for development
```

The tests check:
- Basic get/set operations
- TTL expiration with timers
- Proper cleanup of timers
- Size tracking
- Type safety with generics

### Reflection Questions

After completing:
1. What details were crucial for the AI to generate working code?
2. How did test failures guide your prompt improvements?
3. What did the AI assume that you didn't specify?
4. How would you write the prompt differently next time?

### Extension Ideas (If Time Permits)

Once all tests pass, try adding:
- Maximum cache size with LRU eviction
- Cache statistics (hits, misses, hit rate)
- Bulk operations (setMany, getMany)
- Cache serialization/deserialization

Remember: The goal is learning to write better prompts, not just getting working code!