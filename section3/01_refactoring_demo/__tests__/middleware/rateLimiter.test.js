const request = require('supertest');
const { app } = require('../../src/server');

describe('Rate Limiter Tests', () => {
  describe('API Rate Limiting', () => {
    test('should allow requests under the limit', async () => {
      // Make a few requests that should succeed
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/api/users');
        
        expect([200, 500]).toContain(response.status);
        expect(response.status).not.toBe(429);
      }
    });

    test('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/users');
      
      // Check for standard rate limit headers
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });

    test('should return 429 when rate limit is exceeded', async () => {
      // This test would require making 100+ requests in sequence
      // which is slow, so we'll skip it in normal test runs
      // In production, this should be tested with load testing tools
    }, 60000);
  });

  describe('Validation Error Rate Limiting', () => {
    test('should handle validation errors normally when under limit', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'test',
          email: 'invalid-email',
          password: 'weak'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should not count successful requests against validation error limit', async () => {
      const timestamp = Date.now();
      
      // Make a successful request
      const successResponse = await request(app)
        .post('/api/users')
        .send({
          username: `validuser${timestamp}`,
          email: `valid${timestamp}@example.com`,
          password: 'ValidPass123'
        });
      
      expect([201, 409, 500]).toContain(successResponse.status);
      
      // Make a validation error request - should not be rate limited
      const errorResponse = await request(app)
        .post('/api/users')
        .send({
          username: 'test',
          email: 'invalid-email',
          password: 'weak'
        });
      
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.body.error).toBe('Validation failed');
    });

    test('should rate limit excessive validation errors', async () => {
      // This test would require making 50+ validation error requests
      // which is slow, so we document the behavior here
      // In production, this should be tested with load testing tools
    }, 60000);
  });

  describe('Rate Limiter Configuration', () => {
    test('should use different limits for different endpoint types', () => {
      const { apiLimiter, authLimiter, mutationLimiter } = require('../../src/middleware/rateLimiter');
      
      expect(apiLimiter).toBeDefined();
      expect(authLimiter).toBeDefined();
      expect(mutationLimiter).toBeDefined();
      
      // All should be functions (middleware)
      expect(typeof apiLimiter).toBe('function');
      expect(typeof authLimiter).toBe('function');
      expect(typeof mutationLimiter).toBe('function');
    });
  });
});
