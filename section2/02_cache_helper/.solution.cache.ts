// INSTRUCTOR SOLUTION - DO NOT SHARE WITH STUDENTS

interface CacheItem<T> {
  value: T;
  timer?: NodeJS.Timeout;
}

export class Cache<T = any> {
  private items: Map<string, CacheItem<T>>;

  constructor() {
    this.items = new Map();
  }

  set(key: string, value: T, ttlMs?: number): void {
    // Clear existing timer if overwriting
    const existing = this.items.get(key);
    if (existing?.timer) {
      clearTimeout(existing.timer);
    }

    const item: CacheItem<T> = { value };

    // Set up expiration if TTL provided
    if (ttlMs && ttlMs > 0) {
      item.timer = setTimeout(() => {
        this.items.delete(key);
      }, ttlMs);
    }

    this.items.set(key, item);
  }

  get(key: string): T | undefined {
    const item = this.items.get(key);
    return item?.value;
  }

  has(key: string): boolean {
    return this.items.has(key);
  }

  delete(key: string): boolean {
    const item = this.items.get(key);
    if (item) {
      if (item.timer) {
        clearTimeout(item.timer);
      }
      return this.items.delete(key);
    }
    return false;
  }

  clear(): void {
    // Clear all timers
    for (const item of this.items.values()) {
      if (item.timer) {
        clearTimeout(item.timer);
      }
    }
    this.items.clear();
  }

  size(): number {
    return this.items.size;
  }
}