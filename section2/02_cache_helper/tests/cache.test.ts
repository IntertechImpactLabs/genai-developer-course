import { Cache } from '../src/cache';

describe('Cache', () => {
  let cache: Cache<any>;

  beforeEach(() => {
    cache = new Cache();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve values', () => {
      cache.set('name', 'Alice');
      expect(cache.get('name')).toBe('Alice');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing values', () => {
      cache.set('counter', 1);
      cache.set('counter', 2);
      expect(cache.get('counter')).toBe(2);
    });

    it('should handle different data types', () => {
      cache.set('string', 'hello');
      cache.set('number', 42);
      cache.set('boolean', true);
      cache.set('object', { name: 'test' });
      cache.set('array', [1, 2, 3]);

      expect(cache.get('string')).toBe('hello');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('boolean')).toBe(true);
      expect(cache.get('object')).toEqual({ name: 'test' });
      expect(cache.get('array')).toEqual([1, 2, 3]);
    });
  });

  describe('TTL (Time-To-Live)', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should expire items after TTL', () => {
      cache.set('temp', 'value', 1000); // 1 second TTL
      
      expect(cache.get('temp')).toBe('value');
      
      jest.advanceTimersByTime(500); // Half way through
      expect(cache.get('temp')).toBe('value');
      
      jest.advanceTimersByTime(600); // Past expiration
      expect(cache.get('temp')).toBeUndefined();
    });

    it('should handle items without TTL', () => {
      cache.set('permanent', 'forever');
      
      jest.advanceTimersByTime(100000); // Long time passes
      expect(cache.get('permanent')).toBe('forever');
    });

    it('should reset TTL when overwriting with new TTL', () => {
      cache.set('key', 'value1', 1000);
      
      jest.advanceTimersByTime(500);
      cache.set('key', 'value2', 1000); // Reset with new TTL
      
      jest.advanceTimersByTime(700); // 1200ms total, but only 700ms for new value
      expect(cache.get('key')).toBe('value2');
      
      jest.advanceTimersByTime(400); // Now it should expire
      expect(cache.get('key')).toBeUndefined();
    });
  });

  describe('has() method', () => {
    it('should return true for existing keys', () => {
      cache.set('exists', 'yes');
      expect(cache.has('exists')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('nothere')).toBe(false);
    });

    it('should return false for expired keys', () => {
      jest.useFakeTimers();
      
      cache.set('temp', 'value', 100);
      expect(cache.has('temp')).toBe(true);
      
      jest.advanceTimersByTime(150);
      expect(cache.has('temp')).toBe(false);
      
      jest.clearAllTimers();
    });
  });

  describe('delete() method', () => {
    it('should remove existing keys and return true', () => {
      cache.set('toDelete', 'value');
      const result = cache.delete('toDelete');
      
      expect(result).toBe(true);
      expect(cache.get('toDelete')).toBeUndefined();
    });

    it('should return false when deleting non-existent keys', () => {
      const result = cache.delete('nonexistent');
      expect(result).toBe(false);
    });

    it('should clean up timers when deleting keys with TTL', () => {
      jest.useFakeTimers();
      
      cache.set('temp', 'value', 1000);
      cache.delete('temp');
      
      jest.advanceTimersByTime(1500);
      // Should not throw or cause issues even though timer would have fired
      
      jest.clearAllTimers();
    });
  });

  describe('clear() method', () => {
    it('should remove all items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      cache.clear();
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
      expect(cache.size()).toBe(0);
    });

    it('should clean up all timers', () => {
      jest.useFakeTimers();
      
      cache.set('temp1', 'value1', 1000);
      cache.set('temp2', 'value2', 2000);
      cache.set('permanent', 'value3');
      
      cache.clear();
      
      jest.advanceTimersByTime(3000);
      // Should not throw or cause issues even though timers would have fired
      
      jest.clearAllTimers();
    });
  });

  describe('size() method', () => {
    it('should return 0 for empty cache', () => {
      expect(cache.size()).toBe(0);
    });

    it('should track the number of items', () => {
      cache.set('a', 1);
      expect(cache.size()).toBe(1);
      
      cache.set('b', 2);
      expect(cache.size()).toBe(2);
      
      cache.set('c', 3);
      expect(cache.size()).toBe(3);
    });

    it('should decrease size when items are deleted', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      
      cache.delete('a');
      expect(cache.size()).toBe(1);
    });

    it('should not count expired items', () => {
      jest.useFakeTimers();
      
      cache.set('temp', 'value', 100);
      cache.set('permanent', 'value');
      
      expect(cache.size()).toBe(2);
      
      jest.advanceTimersByTime(150);
      expect(cache.size()).toBe(1);
      
      jest.clearAllTimers();
    });
  });

  describe('Type Safety', () => {
    it('should work with typed cache', () => {
      const stringCache = new Cache<string>();
      stringCache.set('greeting', 'hello');
      
      const value: string | undefined = stringCache.get('greeting');
      expect(value).toBe('hello');
    });

    it('should handle complex types', () => {
      interface User {
        id: number;
        name: string;
      }
      
      const userCache = new Cache<User>();
      const user: User = { id: 1, name: 'Alice' };
      
      userCache.set('user1', user);
      const retrieved = userCache.get('user1');
      
      expect(retrieved).toEqual(user);
    });
  });
});