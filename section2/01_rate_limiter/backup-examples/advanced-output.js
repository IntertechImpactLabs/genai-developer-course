// Rate limiter middleware for Express.js
// Features:
// - 5 login attempts per minute per IP
// - 15-minute lockout after 10 failed attempts (per IP or per user)
// - Sliding window algorithm, memory-efficient
// - Tracks per-IP and per-user
// - Detailed rate limit headers
// - Bypass for admin IPs
// - Comprehensive error handling and logging

const ADMIN_IPS = new Set([
  '127.0.0.1', // Add more admin IPs as needed
]);

// In-memory stores for rate limiting
const ipAttempts = new Map(); // { ip: [timestamps] }
const userAttempts = new Map(); // { username: [timestamps] }
const ipLockouts = new Map(); // { ip: lockoutUntil }
const userLockouts = new Map(); // { username: lockoutUntil }

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_MIN = 5;
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function cleanupOldAttempts(arr, windowMs) {
  const now = Date.now();
  while (arr.length && arr[0] <= now - windowMs) {
    arr.shift();
  }
}

function rateLimiter(options = {}) {
  return function (req, res, next) {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      if (ADMIN_IPS.has(ip)) return next();

      const now = Date.now();
      let username = req.body && req.body.username;
      if (typeof username !== 'string') username = undefined;

      // Check lockouts
      if (ipLockouts.has(ip) && ipLockouts.get(ip) > now) {
        const reset = Math.ceil((ipLockouts.get(ip) - now) / 1000);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', reset);
        console.warn(`[RateLimiter] IP lockout: ${ip}`);
        return res.status(429).json({
          error: 'Too many failed attempts. Try again later.',
          retry_after_seconds: reset,
        });
      }
      if (username && userLockouts.has(username) && userLockouts.get(username) > now) {
        const reset = Math.ceil((userLockouts.get(username) - now) / 1000);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', reset);
        console.warn(`[RateLimiter] User lockout: ${username}`);
        return res.status(429).json({
          error: 'Too many failed attempts for this user. Try again later.',
          retry_after_seconds: reset,
        });
      }

      // Sliding window for IP
      if (!ipAttempts.has(ip)) ipAttempts.set(ip, []);
      const ipArr = ipAttempts.get(ip);
      cleanupOldAttempts(ipArr, WINDOW_SIZE);
      ipArr.push(now);
      if (ipArr.length > MAX_ATTEMPTS_PER_MIN) {
        const reset = Math.ceil((ipArr[0] + WINDOW_SIZE - now) / 1000);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', reset);
        console.info(`[RateLimiter] IP rate limit exceeded: ${ip}`);
        return res.status(429).json({
          error: 'Too many login attempts from this IP. Please wait and try again.',
          retry_after_seconds: reset,
        });
      }
      res.set('X-RateLimit-Remaining', Math.max(0, MAX_ATTEMPTS_PER_MIN - ipArr.length));
      res.set('X-RateLimit-Reset', Math.ceil((ipArr[0] + WINDOW_SIZE - now) / 1000));

      // Sliding window for user (if username provided)
      if (username) {
        if (!userAttempts.has(username)) userAttempts.set(username, []);
        const userArr = userAttempts.get(username);
        cleanupOldAttempts(userArr, WINDOW_SIZE);
        userArr.push(now);
        if (userArr.length > MAX_ATTEMPTS_PER_MIN) {
          const reset = Math.ceil((userArr[0] + WINDOW_SIZE - now) / 1000);
          res.set('X-RateLimit-Remaining', 0);
          res.set('X-RateLimit-Reset', reset);
          console.info(`[RateLimiter] User rate limit exceeded: ${username}`);
          return res.status(429).json({
            error: 'Too many login attempts for this user. Please wait and try again.',
            retry_after_seconds: reset,
          });
        }
      }

      // Attach a callback to record failed attempts
      req.onRateLimitFail = function (isUser) {
        // Record failed attempt for IP
        if (!ipAttempts.has(ip)) ipAttempts.set(ip, []);
        const ipArr = ipAttempts.get(ip);
        ipArr.push(Date.now());
        cleanupOldAttempts(ipArr, LOCKOUT_DURATION);
        if (ipArr.length >= MAX_FAILED_ATTEMPTS) {
          ipLockouts.set(ip, Date.now() + LOCKOUT_DURATION);
          console.warn(`[RateLimiter] IP lockout triggered: ${ip}`);
        }
        // Record failed attempt for user
        if (isUser && username) {
          if (!userAttempts.has(username)) userAttempts.set(username, []);
          const userArr = userAttempts.get(username);
          userArr.push(Date.now());
          cleanupOldAttempts(userArr, LOCKOUT_DURATION);
          if (userArr.length >= MAX_FAILED_ATTEMPTS) {
            userLockouts.set(username, Date.now() + LOCKOUT_DURATION);
            console.warn(`[RateLimiter] User lockout triggered: ${username}`);
          }
        }
      };

      next();
    } catch (err) {
      console.error('[RateLimiter] Middleware error:', err);
      res.status(500).json({ error: 'Internal server error in rate limiter.' });
    }
  };
}

module.exports = rateLimiter;
