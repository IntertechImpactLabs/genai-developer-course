# Rate Limiter Demo

## Purpose
Demonstrate the difference between basic and advanced prompting for code generation.

## Demo Structure

Live comparison showing:
1. Basic vague prompt → generic solution
2. Advanced structured prompt → production-ready solution

## Files

- `prompts.md` - Basic vs advanced prompt examples
- `server.js` - Express server for testing
- `test-api.http` - REST Client file for testing endpoints
- `backup-examples/` - Pre-generated examples if live demo fails

## Running the Demo

### Setup
```bash
npm install
node server.js
```

### Demo Flow

1. **Basic Prompt** (2 minutes)
   - Use: "Create a rate limiter for my API"
   - Show generic, minimal output
   - Point out missing features

2. **Advanced Prompt** (3 minutes)
   - Use structured prompt from `prompts.md`
   - Show production-ready output
   - Highlight improvements:
     - Sliding window algorithm
     - Redis integration
     - Security features
     - Error handling

3. **Test the Implementation** (optional)
   - Use `test-api.http` to test endpoints
   - Show rate limiting in action

## Key Teaching Points

### What Makes Advanced Prompts Better:
1. **Context**: Express.js, authentication use case
2. **Role**: Senior developer perspective
3. **Specific Requirements**: Clear limits and rules
4. **Technology Stack**: Redis for distributed systems
5. **Production Features**: Admin bypass, headers, logging
6. **Usage Example**: Shows expected interface

### Expected Output Differences:

**Basic Output:**
- In-memory storage
- Simple counter
- No error handling
- Missing headers

**Advanced Output:**
- Redis-backed
- Sliding window algorithm
- Comprehensive error handling
- Rate limit headers
- Admin bypass
- Logging integration

## Time Estimate

- Total: 5 minutes
- Basic prompt: 2 minutes
- Advanced prompt: 2 minutes
- Discussion: 1 minute

## Common Issues

- **Live Generation Slow**: Use backup-examples/
- **Redis Not Available**: Show code, explain Redis benefits
- **Time Constraint**: Skip testing, focus on code comparison