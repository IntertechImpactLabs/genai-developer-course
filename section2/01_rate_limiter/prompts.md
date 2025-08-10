# Rate Limiter Demo Prompts

## Basic Prompt (Vague)

```
Create a rate limiter for my API
```

## Advanced Prompt (Well-Structured)

```
Context: Express.js API handling authentication requests
Role: Act as a senior Node.js developer focused on security

Create a rate limiter middleware that:
- Limits login attempts: 5 per minute per IP
- Blocks brute force: 15-minute lockout after 10 failed attempts
- Implements sliding window algorithm with memory-efficient storage
- Tracks both per-IP and per-user rate limits
- Provides detailed rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset)
- Provides clear error messages
- Includes bypass for admin IPs

Example usage pattern:
app.post('/login', rateLimiter({ type: 'login' }), authController.login);

Include comprehensive error handling and logging.
```

## Teaching Points

### What Makes the Advanced Prompt Better:

1. **Context**: Specifies Express.js and authentication use case
2. **Role**: Leverages model's knowledge as senior developer
3. **Specific Requirements**: Clear rate limits and lockout rules
4. **Technology Stack**: Explicitly mentions Redis for distributed systems
5. **Production Features**: Admin bypass, error handling, logging
6. **Usage Example**: Shows expected API interface

### Expected Differences in Output:

- **Basic**: Generic in-memory rate limiter, minimal features
- **Advanced**: Production-ready Redis-based solution with full error handling