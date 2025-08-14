const validation = require('./validation');

describe('Validation Library', () => {
  // Skip tests if validateEmail is not implemented
  const describeIfImplemented = (funcName, func, testSuite) => {
    if (typeof func === 'function') {
      describe(funcName, testSuite);
    } else {
      describe.skip(funcName + ' (not implemented yet)', testSuite);
    }
  };

  describeIfImplemented('validateEmail', validation.validateEmail, () => {
    test('should validate a standard email', () => {
      const result = validation.validateEmail('user@example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('user@example.com');
    });

    test('should validate email with uppercase and trim whitespace', () => {
      const result = validation.validateEmail('  USER@EXAMPLE.COM  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('user@example.com');
    });

    test('should reject email without @ symbol', () => {
      const result = validation.validateEmail('invalid.email');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('@');
    });

    test('should reject empty string', () => {
      const result = validation.validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject null input', () => {
      const result = validation.validateEmail(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject undefined input', () => {
      const result = validation.validateEmail(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject email with double dots in domain', () => {
      const result = validation.validateEmail('user@domain..com');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject common typo .con', () => {
      const result = validation.validateEmail('user@example.con');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject very long email (over 254 chars)', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const result = validation.validateEmail(longEmail);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('254');
    });
  });

  describeIfImplemented('validatePhone', validation.validatePhone, () => {
    test('should validate US phone with country code', () => {
      const result = validation.validatePhone('+1-555-555-5555');
      expect(result.valid).toBe(true);
    });

    test('should validate US phone with parentheses', () => {
      const result = validation.validatePhone('(555) 555-5555');
      expect(result.valid).toBe(true);
    });

    test('should validate UK phone', () => {
      const result = validation.validatePhone('+44 20 7123 4567');
      expect(result.valid).toBe(true);
    });

    test('should reject phone number that is too short', () => {
      const result = validation.validatePhone('12345');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject empty string', () => {
      const result = validation.validatePhone('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject null input', () => {
      const result = validation.validatePhone(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describeIfImplemented('validateCreditCard', validation.validateCreditCard, () => {
    test('should validate a valid Visa card', () => {
      const result = validation.validateCreditCard('4532015112830366');
      expect(result.valid).toBe(true);
    });

    test('should validate Visa with spaces', () => {
      const result = validation.validateCreditCard('4532 0151 1283 0366');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('4532015112830366');
    });

    test('should validate Visa with dashes', () => {
      const result = validation.validateCreditCard('4532-0151-1283-0366');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('4532015112830366');
    });

    test('should reject card with invalid Luhn check', () => {
      const result = validation.validateCreditCard('4532015112830367');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Luhn');
    });

    test('should reject card number that is too short', () => {
      const result = validation.validateCreditCard('123456789');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject non-numeric input', () => {
      const result = validation.validateCreditCard('abcd-efgh-ijkl-mnop');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject empty string', () => {
      const result = validation.validateCreditCard('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject null input', () => {
      const result = validation.validateCreditCard(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});