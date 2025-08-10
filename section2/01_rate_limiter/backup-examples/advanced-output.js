// Advanced Rate Limiter Output (from well-structured prompt)
// Production-ready implementation with Redis, error handling, and security features

const Redis = require('ioredis');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

class DistributedRateLimiter {
  constructor(redisClient, options = {}) {
    this.redis = redisClient;
    this.options = {
      loginAttempts: {
        maxAttempts: options.maxLoginAttempts || 5,
        windowMinutes: options.loginWindowMinutes || 1,
        bruteForceThreshold: options.bruteForceThreshold || 10,
        lockoutMinutes: options.lockoutMinutes || 15,
      },
      adminIPs: options.adminIPs || [],
    };
  }

  /**
   * Check if IP is in admin bypass list
   */
  isAdminIP(ip) {
    return this.options.adminIPs.includes(ip);
  }

  /**
   * Generate Redis keys for tracking
   */
  getKeys(ip, type) {
    const prefix = `rate_limit:${type}`;
    return {
      attempts: `${prefix}:attempts:${ip}`,
      lockout: `${prefix}:lockout:${ip}`,
      bruteForce: `${prefix}:brute_force:${ip}`,
    };
  }

  /**
   * Check if user is currently locked out
   */
  async isLockedOut(ip, type) {
    try {
      const keys = this.getKeys(ip, type);
      const lockout = await this.redis.get(keys.lockout);
      return !!lockout;
    } catch (error) {
      logger.error('Redis error checking lockout:', { error: error.message, ip, type });
      // Fail open in case of Redis issues (configurable)
      return false;
    }
  }

  /**
   * Record an attempt and check if limit exceeded
   */
  async checkRateLimit(ip, type = 'login') {
    // Admin bypass
    if (this.isAdminIP(ip)) {
      logger.info('Admin IP bypassed rate limiting', { ip });
      return { allowed: true, remainingAttempts: null };
    }

    try {
      const keys = this.getKeys(ip, type);
      const config = this.options.loginAttempts;

      // Check if currently locked out
      if (await this.isLockedOut(ip, type)) {
        const ttl = await this.redis.ttl(keys.lockout);
        logger.warn('Blocked attempt from locked out IP', { ip, remainingSeconds: ttl });
        return {
          allowed: false,
          reason: 'LOCKOUT',
          retryAfter: ttl,
          message: `Too many failed attempts. Please try again in ${Math.ceil(ttl / 60)} minutes.`,
        };
      }

      // Increment attempt counter
      const attempts = await this.redis.incr(keys.attempts);
      
      // Set expiry on first attempt
      if (attempts === 1) {
        await this.redis.expire(keys.attempts, config.windowMinutes * 60);
      }

      // Check against rate limit
      if (attempts > config.maxAttempts) {
        // Increment brute force counter
        const bruteForceAttempts = await this.redis.incr(keys.bruteForce);
        
        // Set expiry for brute force tracking (longer window)
        if (bruteForceAttempts === 1) {
          await this.redis.expire(keys.bruteForce, config.lockoutMinutes * 60);
        }

        // Check for brute force lockout
        if (bruteForceAttempts >= config.bruteForceThreshold) {
          await this.redis.setex(
            keys.lockout,
            config.lockoutMinutes * 60,
            JSON.stringify({ lockedAt: new Date().toISOString(), attempts: bruteForceAttempts })
          );
          
          logger.error('Brute force detected, IP locked out', { 
            ip, 
            attempts: bruteForceAttempts,
            lockoutMinutes: config.lockoutMinutes 
          });
          
          return {
            allowed: false,
            reason: 'BRUTE_FORCE_LOCKOUT',
            message: `Account locked due to suspicious activity. Please try again in ${config.lockoutMinutes} minutes.`,
            retryAfter: config.lockoutMinutes * 60,
          };
        }

        logger.warn('Rate limit exceeded', { ip, attempts });
        return {
          allowed: false,
          reason: 'RATE_LIMIT',
          remainingAttempts: 0,
          message: `Rate limit exceeded. Please slow down your requests.`,
        };
      }

      // Request allowed
      const remainingAttempts = config.maxAttempts - attempts;
      logger.debug('Rate limit check passed', { ip, attempts, remainingAttempts });
      
      return {
        allowed: true,
        remainingAttempts,
        attemptsUsed: attempts,
      };

    } catch (error) {
      logger.error('Redis error in rate limiter:', { 
        error: error.message, 
        stack: error.stack,
        ip,
        type 
      });
      
      // Configurable fail-open/fail-closed behavior
      if (process.env.RATE_LIMIT_FAIL_CLOSED === 'true') {
        return {
          allowed: false,
          reason: 'SYSTEM_ERROR',
          message: 'Service temporarily unavailable. Please try again later.',
        };
      }
      
      // Fail open by default for availability
      return { allowed: true, error: true };
    }
  }

  /**
   * Reset rate limit for an IP (e.g., after successful login)
   */
  async reset(ip, type = 'login') {
    try {
      const keys = this.getKeys(ip, type);
      await this.redis.del(keys.attempts, keys.bruteForce);
      logger.info('Rate limit reset for IP', { ip, type });
    } catch (error) {
      logger.error('Error resetting rate limit:', { error: error.message, ip, type });
    }
  }
}

/**
 * Express middleware factory
 */
function createRateLimiterMiddleware(redisClient, options = {}) {
  const rateLimiter = new DistributedRateLimiter(redisClient, options);

  return (config = {}) => {
    return async (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const type = config.type || 'login';

      try {
        const result = await rateLimiter.checkRateLimit(ip, type);

        // Add rate limit headers
        if (result.remainingAttempts !== null && result.remainingAttempts !== undefined) {
          res.setHeader('X-RateLimit-Remaining', result.remainingAttempts);
        }

        if (result.retryAfter) {
          res.setHeader('Retry-After', result.retryAfter);
        }

        if (!result.allowed) {
          logger.warn('Request blocked by rate limiter', {
            ip,
            reason: result.reason,
            path: req.path,
            method: req.method,
          });

          return res.status(429).json({
            error: 'RATE_LIMIT_EXCEEDED',
            message: result.message,
            retryAfter: result.retryAfter,
          });
        }

        // Store rate limiter instance for potential reset after successful auth
        req.rateLimiter = rateLimiter;
        req.rateLimiterIP = ip;

        next();
      } catch (error) {
        logger.error('Unexpected error in rate limiter middleware:', {
          error: error.message,
          stack: error.stack,
        });

        // Don't block request on middleware errors
        next();
      }
    };
  };
}

// Usage example
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

const rateLimiter = createRateLimiterMiddleware(redis, {
  maxLoginAttempts: 5,
  loginWindowMinutes: 1,
  bruteForceThreshold: 10,
  lockoutMinutes: 15,
  adminIPs: process.env.ADMIN_IPS ? process.env.ADMIN_IPS.split(',') : [],
});

// Example Express integration
/*
const express = require('express');
const app = express();

// Apply rate limiter to login endpoint
app.post('/login', rateLimiter({ type: 'login' }), async (req, res) => {
  // Authentication logic here
  
  // On successful login, reset the rate limit
  if (authSuccessful) {
    await req.rateLimiter.reset(req.rateLimiterIP, 'login');
  }
  
  // Rest of login logic...
});
*/

module.exports = {
  DistributedRateLimiter,
  createRateLimiterMiddleware,
};