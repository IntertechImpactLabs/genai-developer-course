import { formatCurrency } from '../src/currencyFormatter';

describe('formatCurrency', () => {
  describe('Basic Functionality', () => {
    test('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
      expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
      expect(formatCurrency(0.99, 'USD')).toBe('$0.99');
    });

    test('should format EUR currency correctly', () => {
      expect(formatCurrency(1234.56, 'EUR')).toMatch(/€|EUR/);
      expect(formatCurrency(1234.56, 'EUR')).toContain('1,234.56');
    });

    test('should format GBP currency correctly', () => {
      expect(formatCurrency(1234.56, 'GBP')).toMatch(/£|GBP/);
      expect(formatCurrency(1234.56, 'GBP')).toContain('1,234.56');
    });

    test('should handle whole numbers', () => {
      expect(formatCurrency(100, 'USD')).toBe('$100.00');
      expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
    });

    test('should handle decimal values', () => {
      expect(formatCurrency(99.99, 'USD')).toBe('$99.99');
      expect(formatCurrency(0.01, 'USD')).toBe('$0.01');
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero amount', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
      expect(formatCurrency(0, 'EUR')).toContain('0.00');
      expect(formatCurrency(0, 'GBP')).toContain('0.00');
    });

    test('should handle negative amounts', () => {
      const result = formatCurrency(-100, 'USD');
      expect(result).toMatch(/-\$100\.00|\$-100\.00|-100\.00/);
    });

    test('should handle large numbers with proper formatting', () => {
      expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
      expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
      expect(formatCurrency(9999999.99, 'USD')).toBe('$9,999,999.99');
    });

    test('should handle very small decimal amounts', () => {
      // Should round to 2 decimal places
      expect(formatCurrency(0.001, 'USD')).toBe('$0.00');
      expect(formatCurrency(0.005, 'USD')).toBe('$0.01');
      expect(formatCurrency(0.999, 'USD')).toBe('$1.00');
    });

    test('should handle case-insensitive currency codes', () => {
      expect(formatCurrency(100, 'usd')).toBe('$100.00');
      expect(formatCurrency(100, 'USD')).toBe('$100.00');
      expect(formatCurrency(100, 'UsD')).toBe('$100.00');
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid amount', () => {
      expect(() => formatCurrency(NaN, 'USD')).toThrow(/amount|valid number/i);
      expect(() => formatCurrency(Infinity, 'USD')).toThrow(/amount|valid number/i);
      expect(() => formatCurrency(-Infinity, 'USD')).toThrow(/amount|valid number/i);
    });

    test('should throw error for invalid currency code', () => {
      expect(() => formatCurrency(100, 'XXX')).toThrow(/unsupported|invalid/i);
      expect(() => formatCurrency(100, 'INVALID')).toThrow(/unsupported|invalid/i);
      expect(() => formatCurrency(100, '')).toThrow(/currency|required/i);
    });

    test('should throw error for null or undefined inputs', () => {
      expect(() => formatCurrency(null as any, 'USD')).toThrow(/amount|required/i);
      expect(() => formatCurrency(undefined as any, 'USD')).toThrow(/amount|required/i);
      expect(() => formatCurrency(100, null as any)).toThrow(/currency|required/i);
      expect(() => formatCurrency(100, undefined as any)).toThrow(/currency|required/i);
    });

    test('should throw error for non-numeric amount', () => {
      expect(() => formatCurrency('100' as any, 'USD')).toThrow(/amount|number/i);
      expect(() => formatCurrency({} as any, 'USD')).toThrow(/amount|number/i);
      expect(() => formatCurrency([] as any, 'USD')).toThrow(/amount|number/i);
    });

    test('should throw error for non-string currency code', () => {
      expect(() => formatCurrency(100, 123 as any)).toThrow(/currency|string/i);
      expect(() => formatCurrency(100, {} as any)).toThrow(/currency|string/i);
      expect(() => formatCurrency(100, [] as any)).toThrow(/currency|string/i);
    });
  });

  describe('Boundary Conditions', () => {
    test('should handle very large amounts', () => {
      // Should handle millions and billions
      expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
      expect(formatCurrency(999999999.99, 'USD')).toBe('$999,999,999.99');
    });

    test('should handle very small amounts', () => {
      expect(formatCurrency(0.01, 'USD')).toBe('$0.01');
      expect(formatCurrency(0.99, 'USD')).toBe('$0.99');
    });

    test('should handle negative amounts', () => {
      expect(formatCurrency(-1000000, 'USD')).toMatch(/-\$1,000,000\.00|\$-1,000,000\.00/);
      expect(formatCurrency(-0.01, 'USD')).toMatch(/-\$0\.01|\$-0\.01/);
    });

    test('should handle minimum positive amount', () => {
      expect(formatCurrency(0.01, 'USD')).toBe('$0.01');
    });
  });

  describe('Currency Support', () => {
    test('should support all required currencies', () => {
      const currencies = ['USD', 'EUR', 'GBP'];
      currencies.forEach(currency => {
        const result = formatCurrency(100, currency);
        // Check that it returns a non-empty string with the amount
        expect(result).toBeTruthy();
        expect(result).toContain('100');
      });
    });

    test('should not support unsupported currencies', () => {
      const unsupported = ['JPY', 'CNY', 'INR', 'AUD', 'CAD'];
      unsupported.forEach(currency => {
        expect(() => formatCurrency(100, currency)).toThrow(/unsupported|invalid/i);
      });
    });
  });
});