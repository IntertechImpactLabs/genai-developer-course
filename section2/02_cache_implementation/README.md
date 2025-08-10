# Cache Implementation Exercise

## Section 2 Part A: Focused Prompt Design

### Overview
Practice writing specific, focused prompts by generating a simple in-memory cache helper in Go.

### Exercise Goals
- Learn what details to include in technical prompts
- Discover how specificity affects code generation quality  
- Practice iterative refinement based on test feedback

### Time: 30 minutes

### Instructions

1. **Initial Setup** (2 min)
   ```bash
   # You're already in the right directory!
   go test -v  # See what tests you need to pass
   ```

2. **Write Your Prompt** (5 min)
   - Look at `cache.go` stub and test file to understand requirements
   - Read `PROMPT_HINTS.md` for Go-specific concepts you'll need
   - Think about what your AI needs to know:
     - What language and package?
     - What functionality?
     - What Go-specific features? (see hints file)
   - Write a clear, specific prompt

3. **Generate Cache Implementation** (10 min)
   - Use your prompt with your AI tool
   - Replace the stub in `cache.go` with generated code
   - Don't just accept the first result - review it!

4. **Test and Debug** (8 min)
   ```bash
   go test -v  # Which tests pass? Which fail?
   ```
   - If tests fail, what was missing from your prompt?
   - Check `PROMPT_HINTS.md` for Go-specific solutions

5. **Refine Your Approach** (5 min)
   - Pick ONE specific improvement
   - Update your prompt or ask for a specific fix
   - Test again

### What You're Building

A cache that can:
- Store and retrieve data by key
- Automatically expire old data
- Handle concurrent access safely (Go uses "goroutines")
- Be cleared entirely

### Important Go Concepts (for non-Go developers)

Since you may not know Go, you'll need to mention these in your prompt:
- **Thread safety**: Use `sync.RWMutex` for concurrent access
- **Expiration**: Use `time.AfterFunc` to schedule automatic deletion
- **Generic storage**: Use `interface{}` to store any type
- **Return patterns**: Go methods often return `(value, exists)`

See `PROMPT_HINTS.md` for more details!

### Testing Your Implementation

```bash
go test -v          # Run all tests
go test -race       # Check for race conditions
```

### Prompt Writing Challenge

Try to get ALL tests passing with your FIRST generation. 

Start with this structure and fill in the details:
```
Language: Go
Task: [describe what you're building]
Requirements:
- [look at the tests to determine requirements]
- [include Go-specific details from PROMPT_HINTS.md]
```

### Reflection Questions

After completing the exercise:
1. What Go-specific details did you need to include?
2. How did the test failures help you improve your prompt?
3. What assumptions did the AI make incorrectly?
4. What would you include in your prompt next time?

### Extension Ideas (If Time Permits)

Once all tests pass, try adding:
- Cache statistics (hits/misses counter)
- Maximum size with eviction
- Batch operations (SetMany/GetMany)
- Performance benchmarks

Remember: The goal is learning to write better prompts, not just getting working code!