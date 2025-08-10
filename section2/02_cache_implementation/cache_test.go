package cache

import (
	"sync"
	"testing"
	"time"
)

func TestNewCache(t *testing.T) {
	c := NewCache()
	if c == nil {
		t.Fatal("NewCache() returned nil")
	}
	
	// Try to use the cache to ensure it's properly initialized
	err := c.Set("test", "value", 1*time.Hour)
	if err != nil {
		t.Fatalf("Newly created cache should accept Set operations: %v", err)
	}
	
	val, ok := c.Get("test")
	if !ok || val != "value" {
		t.Fatal("Newly created cache should work for basic operations")
	}
}

func TestSetAndGet(t *testing.T) {
	c := NewCache()
	
	// Test basic set and get
	err := c.Set("key1", "value1", 1*time.Hour)
	if err != nil {
		t.Fatalf("Set failed: %v", err)
	}
	
	val, ok := c.Get("key1")
	if !ok {
		t.Fatal("Get failed to retrieve existing key")
	}
	
	if val != "value1" {
		t.Fatalf("Expected 'value1', got %v", val)
	}
	
	// Test missing key
	_, ok = c.Get("nonexistent")
	if ok {
		t.Fatal("Get should return false for nonexistent key")
	}
}

func TestExpiration(t *testing.T) {
	c := NewCache()
	
	// Set with short TTL
	err := c.Set("expiring", "value", 100*time.Millisecond)
	if err != nil {
		t.Fatalf("Set failed: %v", err)
	}
	
	// Should exist immediately
	_, ok := c.Get("expiring")
	if !ok {
		t.Fatal("Key should exist immediately after setting")
	}
	
	// Wait for expiration
	time.Sleep(150 * time.Millisecond)
	
	// Should be expired
	_, ok = c.Get("expiring")
	if ok {
		t.Fatal("Key should have expired")
	}
}

func TestDelete(t *testing.T) {
	c := NewCache()
	
	c.Set("key1", "value1", 1*time.Hour)
	
	// Verify it exists
	_, ok := c.Get("key1")
	if !ok {
		t.Fatal("Key should exist before deletion")
	}
	
	// Delete it
	c.Delete("key1")
	
	// Verify it's gone
	_, ok = c.Get("key1")
	if ok {
		t.Fatal("Key should not exist after deletion")
	}
}

func TestClear(t *testing.T) {
	c := NewCache()
	
	// Add multiple items
	c.Set("key1", "value1", 1*time.Hour)
	c.Set("key2", "value2", 1*time.Hour)
	c.Set("key3", "value3", 1*time.Hour)
	
	// First verify items were actually added
	keys := []string{"key1", "key2", "key3"}
	for _, key := range keys {
		_, ok := c.Get(key)
		if !ok {
			t.Fatalf("Key %s should exist before Clear()", key)
		}
	}
	
	// Clear all
	c.Clear()
	
	// Verify all are gone
	for _, key := range keys {
		_, ok := c.Get(key)
		if ok {
			t.Fatalf("Key %s should not exist after Clear()", key)
		}
	}
}

func TestThreadSafety(t *testing.T) {
	c := NewCache()
	var wg sync.WaitGroup
	var successCount int32
	
	// First, add a test key to ensure basic functionality works
	err := c.Set("initial", "value", 1*time.Hour)
	if err != nil {
		t.Fatalf("Cache should accept Set operations: %v", err)
	}
	
	// Run concurrent operations
	for i := 0; i < 100; i++ {
		wg.Add(3)
		
		// Concurrent set
		go func(n int) {
			defer wg.Done()
			key := string(rune('a' + n%26))
			err := c.Set(key, n, 1*time.Hour)
			if err == nil {
				// Only count successes to verify cache is working
				// Don't use atomic here to detect race conditions
				successCount++
			}
		}(i)
		
		// Concurrent get
		go func(n int) {
			defer wg.Done()
			key := string(rune('a' + n%26))
			c.Get(key)
		}(i)
		
		// Concurrent delete
		go func(n int) {
			defer wg.Done()
			key := string(rune('a' + n%26))
			c.Delete(key)
		}(i)
	}
	
	wg.Wait()
	
	// Verify the cache still works after concurrent operations
	val, ok := c.Get("initial")
	if !ok || val != "value" {
		t.Fatal("Cache should still work after concurrent operations")
	}
}

func TestDifferentValueTypes(t *testing.T) {
	c := NewCache()
	
	// Test with different types
	c.Set("string", "hello", 1*time.Hour)
	c.Set("int", 42, 1*time.Hour)
	c.Set("float", 3.14, 1*time.Hour)
	c.Set("bool", true, 1*time.Hour)
	c.Set("slice", []int{1, 2, 3}, 1*time.Hour)
	
	// Verify all types work
	if val, _ := c.Get("string"); val != "hello" {
		t.Errorf("String value mismatch")
	}
	if val, _ := c.Get("int"); val != 42 {
		t.Errorf("Int value mismatch")
	}
	if val, _ := c.Get("float"); val != 3.14 {
		t.Errorf("Float value mismatch")
	}
	if val, _ := c.Get("bool"); val != true {
		t.Errorf("Bool value mismatch")
	}
	if val, _ := c.Get("slice"); len(val.([]int)) != 3 {
		t.Errorf("Slice value mismatch")
	}
}