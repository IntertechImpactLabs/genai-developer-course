# GitHub Copilot Custom Instructions

## Project Overview

This is a mono-repo containing multiple demonstration projects and exercises for a generative AI developer course. Each section contains standalone projects that demonstrate different AI-assisted development concepts and patterns.

## Repository Structure

### Mono-repo Organization
```
/section1/           - Basic prompt engineering exercises
/section2/           - Advanced prompting and RAG demonstrations
/section3/           - AI agents and autonomous workflows
  01_refactoring_demo/ - Express.js app for refactoring demonstration
/section4/           - Production considerations
/shared/             - Shared utilities and datasets
```

<!-- ### Project Types
- **TypeScript Projects**: Use strict TypeScript with proper typing
- **JavaScript Projects**: Use modern ES6+ features with JSDoc comments
- **Python Projects**: Follow PEP 8 style guide
- **Demo Applications**: Intentionally contain anti-patterns for teaching purposes

## Code Style Guidelines

### JavaScript/TypeScript Formatting
- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Line Length**: Maximum 100 characters
- **Arrow Functions**: Use for callbacks and simple functions
- **Async/Await**: Prefer over Promise chains
- **Destructuring**: Use when it improves readability

### Naming Conventions
- **Variables/Functions**: camelCase (`getUserById`, `isValid`)
- **Classes/Constructors**: PascalCase (`UserRepository`, `ValidationError`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_PORT`)
- **Private Members**: Prefix with underscore (`_privateMethod`)
- **Test Files**: `*.test.js` or `*.spec.js`

### Import/Export Style
```javascript
// Prefer named exports for utilities
export const formatCurrency = (amount) => { /* ... */ };
export const validateEmail = (email) => { /* ... */ };

// Use default export for main class/component
export default class UserRepository { /* ... */ }

// Group imports by type
import express from 'express';                    // External packages
import { validateUser } from '../validators';     // Internal modules
import { DATABASE_URL } from '../config';         // Constants
```

### Error Handling
- Always use try-catch blocks in async functions
- Create custom error classes for different error types
- Return meaningful error messages without exposing internals
- Use appropriate HTTP status codes:
  - 400 for validation errors
  - 404 for not found
  - 409 for conflicts (duplicate)
  - 500 for server errors

### API Response Format
Maintain consistent response structure:
```javascript
// Success response
{
  "success": true,
  "data": { /* actual data */ }
}

// Error response
{
  "success": false,
  "error": "Error message",
  "details": { /* optional error details */ }
}
```

## Database Guidelines

### SQLite Specifics
- Use parameterized queries to prevent SQL injection: `db.get("SELECT * FROM users WHERE id = ?", [id])`
- Use transactions for multi-table operations
- Handle `SQLITE_CONSTRAINT` errors for unique violations
- Remember SQLite doesn't have native boolean type (use 0/1)

### Transaction Pattern
```javascript
await db.run('BEGIN TRANSACTION');
try {
  // Multiple operations
  await db.run('COMMIT');
} catch (error) {
  await db.run('ROLLBACK');
  throw error;
}
```

## Testing Requirements

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.test.{js,ts}',
    '!src/**/*.spec.{js,ts}'
  ],
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/*.test.{js,ts}',
    '**/*.spec.{js,ts}'
  ]
};
```

### Test Structure
```javascript
describe('UserRepository', () => {
  let repository;
  
  beforeEach(() => {
    // Setup
    repository = new UserRepository();
  });
  
  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });
  
  describe('findById', () => {
    it('should return user when valid ID provided', async () => {
      // Arrange
      const userId = 1;
      const expectedUser = { id: 1, name: 'John Doe' };
      
      // Act
      const result = await repository.findById(userId);
      
      // Assert
      expect(result).toEqual(expectedUser);
    });
    
    it('should throw NotFoundError when user does not exist', async () => {
      // Test error cases
      await expect(repository.findById(999))
        .rejects.toThrow(NotFoundError);
    });
  });
});
```

### Testing Best Practices
- **AAA Pattern**: Arrange, Act, Assert
- **One Assertion**: One logical assertion per test
- **Descriptive Names**: Use full sentences for test names
- **Mock External**: Mock all external dependencies
- **Test Coverage**: Aim for >80% code coverage
- **Edge Cases**: Always test boundary conditions
- **Error Paths**: Test all error scenarios

## Security Considerations

### Input Validation
- Validate all user inputs before processing
- Sanitize strings to prevent XSS
- Use parameterized queries (never concatenate SQL)
- Implement rate limiting on public endpoints

### Sensitive Data
- Never log passwords or tokens
- Hash passwords using bcrypt (minimum 10 rounds)
- Don't expose internal error details to clients
- Remove sensitive fields from API responses

## Performance Guidelines

- Use database indexes on frequently queried columns
- Implement pagination for list endpoints (default limit: 50)
- Cache frequently accessed, rarely changed data
- Use connection pooling for database connections
- Add query performance logging for queries >100ms

## Development Workflow

### Before Committing
1. Run linter: `npm run lint`
2. Run tests: `npm test`
3. Test API manually with key scenarios
4. Ensure no sensitive data in logs

### Commit Messages
Use conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring
- `test:` Adding tests
- `docs:` Documentation changes

## Project-Specific Guidelines

### Section 3: Refactoring Demo (Express.js)
When working in `section3/01_refactoring_demo/`:
- **Current State**: Database queries mixed in route handlers (intentional anti-pattern)
- **Goal**: Refactor to repository pattern
- **Repository Pattern**: Create classes in `/src/repositories/`
- **Database**: SQLite with parameterized queries
- **Testing**: Use supertest for API testing

### Common Repository Methods
- `findAll()` - Get all records
- `findById(id)` - Get single record by ID
- `findBy(criteria)` - Get records by custom criteria  
- `create(data)` - Insert new record
- `update(id, data)` - Update existing record
- `delete(id)` - Delete record
- `exists(id)` - Check if record exists

## Testing Scripts

### Common NPM Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode during development
npm run test:watch

# Run specific test file
npm test -- user.test.js
```

## Environment Variables

Required environment variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production/test)
- `DATABASE_PATH`: Path to SQLite database file
- `LOG_LEVEL`: Logging verbosity (debug/info/warn/error)

## General Guidelines

### When Writing Code
- **Clarity over Cleverness**: Write readable code that's easy to understand
- **Consistent Style**: Follow existing patterns in each project
- **Comments**: Add JSDoc comments for public APIs
- **Error Messages**: Make them helpful and actionable
- **Logging**: Use appropriate log levels (debug, info, warn, error)

### When Adding Tests
- Write tests alongside implementation
- Test the behavior, not the implementation
- Use meaningful test data (not "test123")
- Group related tests using `describe` blocks
- Keep tests independent and isolated

### When Refactoring
- Ensure tests pass before and after
- Make incremental changes
- Commit at logical checkpoints
- Update documentation as needed
- Follow the boy scout rule: leave code better than you found it

## Course Context

This repository is used for teaching AI-assisted development. Some projects intentionally contain anti-patterns or suboptimal code to demonstrate refactoring capabilities. When working on these projects:

- Understand the teaching objective before making changes
- Preserve intentional anti-patterns unless specifically fixing them
- Focus on clear, educational examples over production optimization
- Keep solutions approachable for developers at all levels -->