export class Cache<T = any> {
  private data = new Map<string, T>();
  private timers = new Map<string, NodeJS.Timeout>();

  constructor() {}

  set(key: string, value: T, ttlMs?: number): void {
    // Clear existing timer if key already exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }

    this.data.set(key, value);

    if (ttlMs) {
      const timer = setTimeout(() => {
        this.data.delete(key);
        this.timers.delete(key);
      }, ttlMs);
      this.timers.set(key, timer);
    }
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  delete(key: string): boolean {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }
    return this.data.delete(key);
  }

  clear(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.data.clear();
  }

  size(): number {
    return this.data.size;
  }
}