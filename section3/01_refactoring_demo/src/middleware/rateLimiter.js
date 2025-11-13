const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for all API endpoints
 * Prevents abuse by limiting requests per IP address
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests, only count errors
  skipSuccessfulRequests: false
});

/**
 * Stricter rate limiter for validation errors
 * Helps prevent brute force attacks and validation probing
 */
const validationErrorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 validation errors per windowMs
  message: {
    error: 'Too many validation errors from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only count validation errors (400 status)
  skip: (req, res) => res.statusCode !== 400,
  skipSuccessfulRequests: true
});

module.exports = {
  apiLimiter,
  validationErrorLimiter
};
