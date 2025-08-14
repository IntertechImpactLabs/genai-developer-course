const request = require('supertest');
const { app } = require('../src/server');

describe('Product Validation Middleware', () => {
  describe('POST /api/products', () => {
    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'name is required'
          }),
          expect.objectContaining({
            field: 'price',
            message: 'price is required'
          })
        ])
      );
    });

    it('should reject negative price', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          price: -5.99
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'price',
            message: expect.stringMatching(/must be between/)
          })
        ])
      );
    });

    it('should reject negative stock', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          price: 10.99,
          stock: -5
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'stock',
            message: expect.stringMatching(/must be between/)
          })
        ])
      );
    });

    it('should sanitize product name', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: '  Test Product  ',
          description: '<script>alert("xss")</script>Safe description',
          price: 29.99,
          stock: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Product');
      // Description should be escaped
      expect(response.body.description).not.toContain('<script>');
    });

    it('should create product successfully with valid data', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Valid Product',
          description: 'A valid product description',
          price: 49.99,
          stock: 50
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Valid Product');
      expect(response.body.price).toBe(49.99);
      expect(response.body.stock).toBe(50);
    });
  });

  describe('GET /api/products', () => {
    it('should reject invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=invalid&maxPrice=notanumber&inStock=maybe');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'minPrice',
            message: expect.stringMatching(/must be a non-negative number/)
          }),
          expect.objectContaining({
            field: 'maxPrice',
            message: expect.stringMatching(/must be a non-negative number/)
          }),
          expect.objectContaining({
            field: 'inStock',
            message: expect.stringMatching(/must be true or false/)
          })
        ])
      );
    });

    it('should accept valid query parameters', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=10&maxPrice=100&inStock=true');

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/products/:id/stock', () => {
    it('should reject invalid stock operation', async () => {
      const response = await request(app)
        .put('/api/products/1/stock')
        .send({
          quantity: 10,
          operation: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'operation',
            message: expect.stringMatching(/must be "add" or "subtract"/)
          })
        ])
      );
    });

    it('should reject non-numeric quantity', async () => {
      const response = await request(app)
        .put('/api/products/1/stock')
        .send({
          quantity: 'ten',
          operation: 'add'
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'quantity',
            message: expect.stringMatching(/must be a number/)
          })
        ])
      );
    });
  });
});