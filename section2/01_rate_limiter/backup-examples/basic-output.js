// Basic Rate Limiter Output (from vague prompt)
// This is what you typically get with a simple "Create a rate limiter" prompt

class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (validRequests.length < this.maxRequests) {
      validRequests.push(now);
      this.requests.set(identifier, validRequests);
      return true;
    }
    
    return false;
  }
}

// Simple middleware
function rateLimiterMiddleware(maxRequests, windowMs) {
  const limiter = new RateLimiter(maxRequests, windowMs);
  
  return (req, res, next) => {
    const ip = req.ip;
    
    if (limiter.isAllowed(ip)) {
      next();
    } else {
      res.status(429).json({ error: 'Too many requests' });
    }
  };
}

module.exports = rateLimiterMiddleware;