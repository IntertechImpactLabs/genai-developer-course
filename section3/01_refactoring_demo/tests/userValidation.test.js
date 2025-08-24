const request = require('supertest');
const { app } = require('../src/server');

describe('User Validation Middleware', () => {
  describe('POST /api/users', () => {
    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'ValidPass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Invalid email format'
          })
        ])
      );
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringMatching(/Password must/)
          })
        ])
      );
    });

    it('should sanitize and validate email correctly', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser_email_sanitize',
          email: '  TEST.SANITIZE@EXAMPLE.COM  ',
          password: 'ValidPass123'
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('test.sanitize@example.com');
    });

    it('should reject email with common typos', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          email: 'user@domain..com',
          password: 'ValidPass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Invalid email format'
          })
        ])
      );
    });

    it('should sanitize username (remove XSS)', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'test<script>alert("xss")</script>user',
          email: 'xsstest@example.com',
          password: 'ValidPass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'username',
            message: expect.stringMatching(/can only contain/)
          })
        ])
      );
    });
  });

  describe('GET /api/users/:id', () => {
    it('should reject invalid ID parameter', async () => {
      const response = await request(app)
        .get('/api/users/invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'id must be a positive integer'
          })
        ])
      );
    });

    it('should accept valid numeric ID', async () => {
      const response = await request(app)
        .get('/api/users/1');

      // Should pass validation (might return 404 if user doesn't exist, but that's OK)
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should require at least one field for update', async () => {
      const response = await request(app)
        .put('/api/users/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'body',
            message: expect.stringMatching(/At least one field/)
          })
        ])
      );
    });
  });
});