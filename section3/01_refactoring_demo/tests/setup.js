// Setup file for tests
const path = require('path');

// Set up test database path to avoid conflicts
process.env.DATABASE_PATH = path.join(__dirname, '..', 'test-database.db');

// Ensure we're in test mode
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);