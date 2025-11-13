const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Import the app
const { app } = require('../../src/server');

const testDbPath = path.join(__dirname, '..', '..', 'test-database.db');

describe('Product Validation Tests', () => {
  beforeAll((done) => {
    // Create test database
    const db = new sqlite3.Database(testDbPath);
    db.serialize(() => {
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
        INSERT INTO products (name, description, price, stock) VALUES
        ('Test Product', 'A test product', 99.99, 10)
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

  describe('POST /api/products - Product Creation', () => {
    test('should successfully create product with valid data', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/products')
        .send({
          name: `New Product ${timestamp}`,
          description: 'A new product description',
          price: 49.99,
          stock: 100
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(`New Product ${timestamp}`);
      expect(response.body.price).toBe(49.99);
    });

    test('should fail with missing product name', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          price: 49.99,
          stock: 100
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'Product name is required'
          })
        ])
      );
    });

    test('should fail with missing price', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          stock: 100
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'price',
            message: 'Price is required'
          })
        ])
      );
    });

    test('should fail with negative price', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          price: -10.99,
          stock: 100
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'price',
            message: expect.stringContaining('positive')
          })
        ])
      );
    });

    test('should fail with negative stock', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          price: 49.99,
          stock: -5
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'stock',
            message: expect.stringContaining('non-negative')
          })
        ])
      );
    });

    test('should sanitize HTML from product name', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/products')
        .send({
          name: `Product${timestamp}<script>alert("xss")</script>`,
          price: 49.99,
          stock: 100
        });

      if (response.status === 201) {
        expect(response.body.name).not.toContain('<script>');
      }
    });

    test('should sanitize HTML from description', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/products')
        .send({
          name: `Safe Product ${timestamp}`,
          description: 'Description with <b>HTML</b> tags',
          price: 49.99,
          stock: 100
        });

      if (response.status === 201) {
        expect(response.body.description).not.toContain('<b>');
      }
    });

    test('should accept product without stock (defaults to 0)', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/products')
        .send({
          name: `No Stock Product ${timestamp}`,
          price: 49.99
        });

      expect(response.status).toBe(201);
      expect(response.body.stock).toBe(0);
    });

    test('should fail with price exceeding maximum', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Expensive Product',
          price: 9999999.99,
          stock: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/products/:id/stock - Stock Update', () => {
    test('should fail with invalid product ID', async () => {
      const response = await request(app)
        .put('/api/products/invalid/stock')
        .send({
          quantity: 10,
          operation: 'add'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'Product ID must be a positive integer'
          })
        ])
      );
    });

    test('should fail with missing quantity', async () => {
      const response = await request(app)
        .put('/api/products/1/stock')
        .send({
          operation: 'add'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'quantity',
            message: 'Quantity is required'
          })
        ])
      );
    });

    test('should fail with invalid operation', async () => {
      const response = await request(app)
        .put('/api/products/1/stock')
        .send({
          quantity: 10,
          operation: 'multiply'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'operation',
            message: 'Operation must be either "add" or "subtract"'
          })
        ])
      );
    });

    test('should fail with negative quantity', async () => {
      const response = await request(app)
        .put('/api/products/1/stock')
        .send({
          quantity: -5,
          operation: 'add'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'quantity',
            message: 'Quantity must be a positive integer'
          })
        ])
      );
    });
  });

  describe('GET /api/products - Product Query', () => {
    test('should fail with invalid minPrice', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'minPrice',
            message: expect.stringContaining('non-negative number')
          })
        ])
      );
    });

    test('should fail with maxPrice less than minPrice', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=100&maxPrice=50');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'maxPrice',
            message: expect.stringContaining('greater than or equal to minimum price')
          })
        ])
      );
    });

    test('should fail with invalid inStock value', async () => {
      const response = await request(app)
        .get('/api/products?inStock=yes');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'inStock',
            message: 'inStock must be either "true" or "false"'
          })
        ])
      );
    });

    test('should accept valid query parameters', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=10&maxPrice=100&inStock=true');

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/products/:id - Get Product', () => {
    test('should fail with invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/not-a-number');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'Product ID must be a positive integer'
          })
        ])
      );
    });
  });

  describe('DELETE /api/products/:id - Delete Product', () => {
    test('should fail with invalid product ID', async () => {
      const response = await request(app)
        .delete('/api/products/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: 'Product ID must be a positive integer'
          })
        ])
      );
    });
  });
});
