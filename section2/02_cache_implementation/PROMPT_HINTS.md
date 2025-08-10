# Prompt Hints for Cache Implementation

## Go Language Basics You Need to Know

Since you may not know Go, here are the essential concepts to mention in your prompt:

### Thread Safety in Go
- Go uses "goroutines" for concurrent programming
- For thread-safe code, tell the AI to use `sync.RWMutex` (read-write mutex)
- Mention that the cache needs to be "goroutine-safe" or "thread-safe"

### Time Handling in Go
- Go has a `time` package for durations and timers
- For automatic expiration, mention using `time.AfterFunc` to schedule future actions
- TTL (time-to-live) is typically expressed as `time.Duration`

### Go Method Signatures
When you see this in the test:
```go
c.Set("key", "value", 1*time.Hour)
```
The AI needs to know the method signature should be:
```
Set(key string, value interface{}, ttl time.Duration) error
```

### Go Return Patterns
- Go often returns multiple values: `(value, ok/exists)`
- For Get(), the pattern is: `(interface{}, bool)` where bool indicates if the key was found

## Building Your Prompt - Key Elements

### Must Include:
1. **Language**: "Go" or "Golang"
2. **Package name**: "cache" (look at the test file's first line)
3. **Thread safety**: "Use sync.RWMutex for thread safety"
4. **Expiration**: "Use time.AfterFunc for automatic expiration"
5. **Return patterns**: "Get should return (value, exists bool)"

### Structure Your Prompt Like This:
```
Language: [specify Go]
Task: [what you're building]
Requirements:
- [list each requirement clearly]
- [include Go-specific details mentioned above]
```

## Before You Start Writing Your Prompt

Look at the test file and identify:
1. What methods are being called? (Set, Get, Delete, Clear, NewCache)
2. What parameters do they take?
3. What do they return?

## Common First-Generation Issues

### TestExpiration fails?
- Did you mention "automatic expiration using time.AfterFunc"?
- Did you specify TTL should be a `time.Duration`?

### TestThreadSafety fails or panics?
- Did you mention "sync.RWMutex" specifically?
- Did you say the cache should be "goroutine-safe"?

### TestSetAndGet fails?
- Did you specify Get returns `(interface{}, bool)`?
- The bool should be false for missing keys

### TestDifferentValueTypes fails?
- Did you mention storing `interface{}` values (Go's way of saying "any type")?

## Debugging Failed Tests

When a test fails:
1. Run `go test -v` to see which test failed
2. Look at the test code to understand what it expects
3. Add the missing requirement to your prompt

Example:
- If TestExpiration fails → Add "automatic expiration with time.AfterFunc"
- If race conditions occur → Add "thread-safe with sync.RWMutex"

## Example Prompt Structure (Fill in the blanks!)

```
Language: Go

Task: Create a _____ cache package

Requirements:
- Package name: cache
- Thread-safe using _____ (hint: sync.RWMutex)
- Store any type of value using _____ (hint: interface{})
- Automatic expiration using _____ (hint: time.AfterFunc)
- Methods needed:
  - NewCache() - returns _____
  - Set() - parameters: _____, returns: _____
  - Get() - parameters: _____, returns: (_____, bool)
  - Delete() - parameters: _____
  - Clear() - parameters: none
```

## Remember

The goal is to learn what level of detail produces working code. Even if you don't know Go, you can:
1. Use the Go-specific hints above
2. Look at test failures to understand what's missing
3. Iterate your prompt with more specific requirements

Each iteration teaches you what details matter for good code generation!