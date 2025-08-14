# Input Validation and Sanitization Middleware

This document describes the comprehensive input validation and sanitization system implemented for the Express.js refactoring demo application.

## Overview

The validation middleware provides:
- **Input validation** using express-validator
- **Data sanitization** to prevent XSS attacks
- **Consistent error responses** across all endpoints
- **Type safety** for all user inputs
- **Rate limiting** for validation errors

## Validation Rules

### Email Validation
- **Format**: RFC 5322 compliant
- **Normalization**: Lowercase, trimmed
- **Length**: Maximum 254 characters
- **Security**: Checks for common typos (double dots, .con domains)

```javascript
// Valid
"user@example.com"
"  USER@EXAMPLE.COM  " // Becomes "user@example.com"

// Invalid
"invalid.email"
"user@domain..com"
"user@example.con"
```

### Password Validation
- **Length**: 8-128 characters
- **Complexity**: Must contain uppercase, lowercase, and number
- **No sanitization**: Passwords are not modified

```javascript
// Valid
"ValidPass123"
"MySecure1Password"

// Invalid
"weak"           // Too short
"nouppercase123" // No uppercase
"NOLOWERCASE123" // No lowercase
"NoNumbers"      // No numbers
```

### Username Validation
- **Length**: 3-50 characters
- **Characters**: Letters, numbers, underscores, hyphens only
- **Sanitization**: Trimmed and HTML-escaped

```javascript
// Valid
"user123"
"test_user"
"user-name"

// Invalid
"u"              // Too short
"user@name"      // Invalid characters
"user space"     // Space not allowed
```

### Numeric Validation
- **Type**: Must be numeric
- **Range**: Configurable min/max values
- **Examples**:
  - Price: 0.01 - 999,999.99
  - Stock: 0 - 999,999
  - User ID: 1+

### String Validation
- **Length**: Configurable limits
- **Sanitization**: Trimmed and HTML-escaped
- **XSS Protection**: Converts `<script>` to `&lt;script&gt;`

## Error Response Format

All validation errors return HTTP 400 with a consistent format:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be between 8 and 128 characters",
      "value": "weak"
    }
  ]
}
```

## Validated Endpoints

### User Routes
- `POST /api/users` - Create user (username, email, password)
- `PUT /api/users/:id` - Update user (username, email optional)
- `GET /api/users/:id` - Get user by ID (numeric ID)
- `DELETE /api/users/:id` - Delete user (numeric ID)

### Product Routes
- `POST /api/products` - Create product (name, price required; description, stock optional)
- `GET /api/products` - List products (optional minPrice, maxPrice, inStock filters)
- `GET /api/products/:id` - Get product by ID (numeric ID)
- `PUT /api/products/:id/stock` - Update stock (quantity, operation)
- `DELETE /api/products/:id` - Delete product (numeric ID)

### Order Routes
- `POST /api/orders` - Create order (userId, items array)
- `GET /api/orders` - List orders (optional userId, status filters)
- `GET /api/orders/:id` - Get order by ID (numeric ID)
- `PUT /api/orders/:id/status` - Update status (valid status enum)

## Security Features

### XSS Prevention
All string inputs are automatically sanitized:
```javascript
Input:  "<script>alert('xss')</script>"
Output: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
```

### Rate Limiting
- **Limit**: 50 validation errors per IP per 15 minutes
- **Response**: HTTP 429 with retry-after header
- **Reset**: Automatic after time window expires

### SQL Injection Prevention
- **Method**: Parameterized queries (already implemented)
- **Validation**: Additional layer of type checking
- **Sanitization**: Input cleaning before database operations

## Testing

The validation system includes comprehensive tests:
- **Unit tests**: Individual validation rules
- **Integration tests**: Complete endpoint validation
- **Edge cases**: Boundary values and error conditions
- **Security tests**: XSS prevention and injection attempts

Run tests:
```bash
cd section3/01_refactoring_demo
npm test
```

## Usage Examples

### Valid User Creation
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Invalid User Creation
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "u",
    "email": "invalid-email",
    "password": "weak"
  }'
```

Returns:
```json
{
  "error": "Validation failed",
  "details": [
    {"field": "username", "message": "Username must be between 3 and 50 characters"},
    {"field": "email", "message": "Invalid email format"},
    {"field": "password", "message": "Password must be between 8 and 128 characters"}
  ]
}
```

## Implementation Details

### File Structure
```
src/middleware/validation/
├── index.js              # Main exports
├── rules.js              # Reusable validation rules
├── errorHandler.js       # Error handling middleware
├── userValidation.js     # User-specific schemas
├── productValidation.js  # Product-specific schemas
└── orderValidation.js    # Order-specific schemas
```

### Middleware Application
```javascript
const { createUserValidation, handleValidationErrors, rateLimit } = require('../middleware/validation');

router.post('/', rateLimit, createUserValidation, handleValidationErrors, (req, res) => {
  // Route logic - validation already passed
});
```

## Performance Considerations

- **Lightweight**: express-validator is optimized for Express
- **Early validation**: Fails fast on invalid input
- **Minimal overhead**: Only validates what's necessary
- **Caching**: Validation rules are compiled once

## Future Enhancements

1. **Redis-based rate limiting** for production
2. **Custom validation messages** per locale
3. **File upload validation** for multimedia content
4. **Advanced password policies** (entropy checking)
5. **IP whitelisting** for admin operations