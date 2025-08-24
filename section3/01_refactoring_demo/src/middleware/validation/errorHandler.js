const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Returns a consistent error format across all endpoints
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const details = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      details
    });
  }
  
  next();
};

/**
 * Rate limiting for validation errors (basic implementation)
 * In production, would use redis-based rate limiting
 */
const validationRateLimit = new Map();

const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 50; // max validation errors per window
  
  if (!validationRateLimit.has(ip)) {
    validationRateLimit.set(ip, { count: 0, resetTime: now + windowMs });
  }
  
  const limiter = validationRateLimit.get(ip);
  
  if (now > limiter.resetTime) {
    limiter.count = 0;
    limiter.resetTime = now + windowMs;
  }
  
  limiter.count++;
  
  if (limiter.count > maxAttempts) {
    return res.status(429).json({
      error: 'Too many validation errors. Please try again later.',
      retryAfter: Math.ceil((limiter.resetTime - now) / 1000)
    });
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  rateLimit
};