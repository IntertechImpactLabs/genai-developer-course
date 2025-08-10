// STUB IMPLEMENTATION - Replace with your AI-generated code!
// Note: Some tests may pass accidentally with this stub.
// Your goal is to make ALL tests pass with a real implementation.

export class Cache<T = any> {
  // TODO: Add private fields for storing data and timers

  constructor() {
    // TODO: Initialize your cache storage
  }

  set(key: string, value: T, ttlMs?: number): void {
    // TODO: Store the value with optional TTL (time-to-live in milliseconds)
    // If ttlMs is provided, the item should automatically expire after that time
  }

  get(key: string): T | undefined {
    // TODO: Retrieve the value for the given key
    // Return undefined if key doesn't exist or has expired
    return undefined;
  }

  has(key: string): boolean {
    // TODO: Check if a key exists and hasn't expired
    return false;
  }

  delete(key: string): boolean {
    // TODO: Remove a key from the cache
    // Return true if the key existed and was removed, false otherwise
    return false;
  }

  clear(): void {
    // TODO: Remove all items from the cache
    // Don't forget to clean up any active timers!
  }

  size(): number {
    // TODO: Return the number of items currently in the cache
    return 0;
  }
}