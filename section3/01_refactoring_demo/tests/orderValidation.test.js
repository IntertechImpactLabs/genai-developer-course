const request = require('supertest');
const { app } = require('../src/server');

describe('Order Validation Middleware', () => {
  describe('POST /api/orders', () => {
    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'userId',
            message: 'userId is required'
          }),
          expect.objectContaining({
            field: 'items',
            message: 'items must be a non-empty array'
          })
        ])
      );
    });

    it('should reject invalid userId', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 'invalid',
          items: [{ productId: 1, quantity: 1 }]
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'userId',
            message: 'userId must be a number'
          })
        ])
      );
    });

    it('should reject empty items array', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1,
          items: []
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'items',
            message: 'items must be a non-empty array'
          })
        ])
      );
    });

    it('should reject invalid item structure', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1,
          items: [
            { productId: 'invalid', quantity: 1 },
            { productId: 1, quantity: 0 },
            { productId: 2 } // missing quantity
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'items',
            message: expect.stringMatching(/productId must be a positive integer|quantity must be a positive integer|must have productId and quantity/)
          })
        ])
      );
    });

    it('should accept valid order structure', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: 1,
          items: [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 }
          ]
        });

      // Should pass validation (might fail later due to business logic, but validation should pass)
      expect([201, 400, 404]).toContain(response.status);
      
      // If it fails with 400, it should be a business logic error, not validation
      if (response.status === 400) {
        expect(response.body.error).not.toBe('Validation failed');
      }
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    it('should reject invalid status', async () => {
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
            message: expect.stringMatching(/Status must be one of/)
          })
        ])
      );
    });

    it('should accept valid status', async () => {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      for (const status of validStatuses) {
        const response = await request(app)
          .put('/api/orders/1/status')
          .send({ status });

        // Should pass validation (might fail later due to business logic or missing order)
        expect([200, 400, 404]).toContain(response.status);
        
        // If it fails with 400, it should be a business logic error, not validation
        if (response.status === 400) {
          expect(response.body.error).not.toBe('Validation failed');
        }
      }
    });

    it('should reject invalid order ID', async () => {
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
            message: 'id must be a positive integer'
          })
        ])
      );
    });
  });

  describe('GET /api/orders', () => {
    it('should reject invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/orders?userId=invalid&status=invalid_status');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'userId',
            message: 'userId must be a positive integer'
          }),
          expect.objectContaining({
            field: 'status',
            message: expect.stringMatching(/status must be one of/)
          })
        ])
      );
    });

    it('should accept valid query parameters', async () => {
      const response = await request(app)
        .get('/api/orders?userId=1&status=pending');

      expect([200, 404]).toContain(response.status);
    });
  });
});