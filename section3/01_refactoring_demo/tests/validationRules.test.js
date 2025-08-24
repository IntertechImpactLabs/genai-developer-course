const { validationResult } = require('express-validator');
const {
  emailValidation,
  passwordValidation,
  usernameValidation,
  stringValidation,
  numericValidation,
  orderItemsValidation
} = require('../src/middleware/validation/rules');

// Helper function to test validation rules
const testValidation = async (validations, data) => {
  const req = { body: data };
  
  // Run all validations
  for (const validation of validations) {
    await validation.run(req);
  }
  
  return validationResult(req);
};

describe('Validation Rules', () => {
  describe('emailValidation', () => {
    it('should validate RFC compliant emails', async () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'valid+email@test-domain.com'
      ];

      for (const email of validEmails) {
        const result = await testValidation([emailValidation()], { email });
        expect(result.isEmpty()).toBe(true);
      }
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid.email',
        '@domain.com',
        'user@',
        'user@domain..com',
        'user@example.con'
      ];

      for (const email of invalidEmails) {
        const result = await testValidation([emailValidation()], { email });
        expect(result.isEmpty()).toBe(false);
      }
    });

    it('should normalize email addresses', async () => {
      const req = { body: { email: '  USER@EXAMPLE.COM  ' } };
      await emailValidation().run(req);
      // After trim and normalizeEmail, it should be lowercase and trimmed
      expect(req.body.email).toBe('user@example.com');
    });

    it('should enforce length limits', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = await testValidation([emailValidation()], { email: longEmail });
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('passwordValidation', () => {
    it('should accept strong passwords', async () => {
      const strongPasswords = [
        'ValidPass123',
        'Complex1Password',
        'Str0ng#Password'
      ];

      for (const password of strongPasswords) {
        const result = await testValidation([passwordValidation()], { password });
        expect(result.isEmpty()).toBe(true);
      }
    });

    it('should reject weak passwords', async () => {
      const weakPasswords = [
        'short',           // too short
        'nouppercase123',  // no uppercase
        'NOLOWERCASE123',  // no lowercase
        'NoNumbers',       // no numbers
        'a'.repeat(200)    // too long
      ];

      for (const password of weakPasswords) {
        const result = await testValidation([passwordValidation()], { password });
        expect(result.isEmpty()).toBe(false);
      }
    });
  });

  describe('usernameValidation', () => {
    it('should accept valid usernames', async () => {
      const validUsernames = [
        'user123',
        'test_user',
        'user-name',
        'validUser'
      ];

      for (const username of validUsernames) {
        const result = await testValidation([usernameValidation()], { username });
        expect(result.isEmpty()).toBe(true);
      }
    });

    it('should reject invalid usernames', async () => {
      const invalidUsernames = [
        'u',              // too short
        'a'.repeat(60),   // too long
        'user@name',      // invalid characters
        'user space',     // space not allowed
        'user.name'       // dot not allowed
      ];

      for (const username of invalidUsernames) {
        const result = await testValidation([usernameValidation()], { username });
        expect(result.isEmpty()).toBe(false);
      }
    });

    it('should trim and escape usernames', async () => {
      const req = { body: { username: '  test_user  ' } };
      await usernameValidation().run(req);
      expect(req.body.username).toBe('test_user');
    });
  });

  describe('numericValidation', () => {
    it('should accept valid numbers within range', async () => {
      const result = await testValidation(
        [numericValidation('price', { min: 0, max: 1000 })],
        { price: '99.99' }
      );
      expect(result.isEmpty()).toBe(true);
    });

    it('should reject non-numeric values', async () => {
      const result = await testValidation(
        [numericValidation('price')],
        { price: 'not_a_number' }
      );
      expect(result.isEmpty()).toBe(false);
    });

    it('should reject values outside range', async () => {
      const result = await testValidation(
        [numericValidation('price', { min: 10, max: 100 })],
        { price: '200' }
      );
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('orderItemsValidation', () => {
    it('should accept valid order items', async () => {
      const validItems = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ];

      const result = await testValidation([orderItemsValidation()], { items: validItems });
      expect(result.isEmpty()).toBe(true);
    });

    it('should reject invalid order items', async () => {
      const invalidItems = [
        { productId: 'invalid', quantity: 1 },
        { productId: 1, quantity: 0 },
        { productId: 1 } // missing quantity
      ];

      const result = await testValidation([orderItemsValidation()], { items: invalidItems });
      expect(result.isEmpty()).toBe(false);
    });

    it('should reject empty items array', async () => {
      const result = await testValidation([orderItemsValidation()], { items: [] });
      expect(result.isEmpty()).toBe(false);
    });
  });
});