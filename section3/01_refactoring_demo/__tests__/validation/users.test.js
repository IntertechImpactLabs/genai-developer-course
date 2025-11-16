const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Import the app
const { app } = require('../../src/server');

const testDbPath = path.join(__dirname, '..', '..', 'test-database.db');

describe('User Validation Tests', () => {
  beforeAll((done) => {
    // Create test database
    const db = new sqlite3.Database(testDbPath);
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      db.run(`
        INSERT INTO users (username, email, password) VALUES
        ('existing_user', 'existing@example.com', 'password123')
      `, done);
    });
  });

  afterAll((done) => {
    // Clean up test database
    const db = new sqlite3.Database(testDbPath);
    db.close(() => {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
      done();
    });
  });

  describe('POST /api/users - User Registration', () => {
    test('should successfully create user with valid data', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/users')
        .send({
          username: `newuser${timestamp}`,
          email: `newuser${timestamp}@example.com`,
          password: 'SecurePass123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(`newuser${timestamp}`);
    });

    test('should fail with missing username', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'username',
            message: 'Username is required'
          })
        ])
      );
    });

    test('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'SecurePass123'
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

    test('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    test('should fail with password missing uppercase', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'lowercase123'
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('uppercase')
          })
        ])
      );
    });

    test('should sanitize username with HTML tags', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/users')
        .send({
          username: `test${timestamp}user`,
          email: `sanitize${timestamp}@example.com`,
          password: 'SecurePass123'
        });

      if (response.status === 201) {
        expect(response.body.username).not.toContain('<script>');
      }
    });

    test('should normalize email to lowercase', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/users')
        .send({
          username: `normalizeuser${timestamp}`,
          email: `NormalIZE${timestamp}@Example.COM`,
          password: 'SecurePass123'
        });

      if (response.status === 201) {
        expect(response.body.email).toBe(`normalize${timestamp}@example.com`);
      }
    });

    test('should fail with username containing invalid characters', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'test user!@#',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'username',
            message: expect.stringContaining('letters, numbers, underscores, and hyphens')
          })
        ])
      );
    });
  });

  describe('PUT /api/users/:id - User Update', () => {
    test('should fail with invalid user ID', async () => {
      const response = await request(app)
        .put('/api/users/invalid')
        .send({
          username: 'updateduser'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'User ID must be a positive integer'
          })
        ])
      );
    });

    test('should fail with no fields provided', async () => {
      const response = await request(app)
        .put('/api/users/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should fail with invalid email in update', async () => {
      const response = await request(app)
        .put('/api/users/1')
        .send({
          email: 'not-an-email'
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
  });

  describe('GET /api/users/:id - Get User', () => {
    test('should fail with invalid user ID', async () => {
      const response = await request(app)
        .get('/api/users/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'User ID must be a positive integer'
          })
        ])
      );
    });

    test('should fail with negative user ID', async () => {
      const response = await request(app)
        .get('/api/users/-1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('DELETE /api/users/:id - Delete User', () => {
    test('should fail with invalid user ID', async () => {
      const response = await request(app)
        .delete('/api/users/not-a-number');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'User ID must be a positive integer'
          })
        ])
      );
    });
  });
});
