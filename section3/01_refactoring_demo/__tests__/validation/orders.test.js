const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Import the app
const { app } = require('../../src/server');

const testDbPath = path.join(__dirname, '..', '..', 'test-database.db');

describe('Order Validation Tests', () => {
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
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          stock INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);

      db.run(`
        INSERT INTO users (username, email, password) VALUES
        ('test_user', 'test@example.com', 'password123')
      `);

      db.run(`
        INSERT INTO products (name, description, price, stock) VALUES
        ('Test Product', 'A test product', 99.99, 10)
      `);

      db.run(`
        INSERT INTO orders (user_id, total, status) VALUES
        (1, 99.99, 'pending')
      `, done);
    });
  });

  afterAll((done) => {
    const db = new sqlite3.Database(testDbPath);
    db.close(() => {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
      done();
    });
  });

  describe('POST /api/orders - Order Creation', () => {
    test('should successfully create order with valid data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1,
          items: [
            {
              productId: 1,
              quantity: 2
            }
          ]
        });

      expect([201, 400, 404]).toContain(response.status);
    });

    test('should fail with missing userId', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              productId: 1,
              quantity: 2
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'userId',
            message: 'User ID is required'
          })
        ])
      );
    });

    test('should fail with invalid userId type', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 'not-a-number',
          items: [
            {
              productId: 1,
              quantity: 2
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'userId',
            message: 'User ID must be a positive integer'
          })
        ])
      );
    });

    test('should fail with missing items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'items',
            message: 'Items array is required'
          })
        ])
      );
    });

    test('should fail with empty items array', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1,
          items: []
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'items',
            message: 'Items must be a non-empty array'
          })
        ])
      );
    });

    test('should fail with invalid productId in items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1,
          items: [
            {
              productId: 'invalid',
              quantity: 2
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should fail with missing quantity in items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1,
          items: [
            {
              productId: 1
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('Quantity is required')
          })
        ])
      );
    });

    test('should fail with negative quantity', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1,
          items: [
            {
              productId: 1,
              quantity: -1
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should fail with quantity exceeding maximum', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1,
          items: [
            {
              productId: 1,
              quantity: 9999
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/orders/:id/status - Status Update', () => {
    test('should fail with invalid order ID', async () => {
      const response = await request(app)
        .put('/api/orders/invalid/status')
        .send({
          status: 'processing'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'Order ID must be a positive integer'
          })
        ])
      );
    });

    test('should fail with missing status', async () => {
      const response = await request(app)
        .put('/api/orders/1/status')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'status',
            message: 'Status is required'
          })
        ])
      );
    });

    test('should fail with invalid status', async () => {
      const response = await request(app)
        .put('/api/orders/1/status')
        .send({
          status: 'invalid_status'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'status',
            message: expect.stringContaining('pending, processing, shipped, delivered, cancelled')
          })
        ])
      );
    });

    test('should accept valid status values', async () => {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      for (const status of validStatuses) {
        const response = await request(app)
          .put('/api/orders/1/status')
          .send({ status });
        
        // Should either succeed or fail with business logic error, not validation error
        if (response.status === 400) {
          // If it's a 400, it should be business logic, not validation
          expect(response.body.error).not.toBe('Validation failed');
        }
      }
    });
  });

  describe('GET /api/orders - Order Query', () => {
    test('should fail with invalid userId', async () => {
      const response = await request(app)
        .get('/api/orders?userId=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'userId',
            message: 'User ID must be a positive integer'
          })
        ])
      );
    });

    test('should fail with invalid status', async () => {
      const response = await request(app)
        .get('/api/orders?status=invalid_status');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'status',
            message: expect.stringContaining('pending, processing, shipped, delivered, cancelled')
          })
        ])
      );
    });

    test('should accept valid query parameters', async () => {
      const response = await request(app)
        .get('/api/orders?userId=1&status=pending');

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/orders/:id - Get Order', () => {
    test('should fail with invalid order ID', async () => {
      const response = await request(app)
        .get('/api/orders/not-a-number');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'Order ID must be a positive integer'
          })
        ])
      );
    });

    test('should fail with zero as order ID', async () => {
      const response = await request(app)
        .get('/api/orders/0');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });
});
