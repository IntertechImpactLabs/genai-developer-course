# Refactoring Demo - Section 3A

## Overview

This is a sample Express.js application demonstrating **anti-patterns** with database queries scattered throughout route handlers. This application is intentionally designed to be refactored during the Section 3A demo to showcase how AI assistants can help with multi-file refactoring tasks.

## Anti-Patterns Present

1. **Direct database connections in route files** - Each route file creates its own database connection
2. **SQL queries mixed with business logic** - Database queries are embedded directly in route handlers
3. **No separation of concerns** - Data access, business logic, and HTTP handling are all mixed together
4. **Duplicate code** - Similar database operations repeated across files
5. **Complex transaction logic in routes** - Order creation transaction handled directly in the route
6. **No abstraction layer** - Direct SQLite3 API usage throughout

## Prerequisites

- Node.js 18+
- SQLite3 (included in the course dev container)

## Setup

```bash
# Install dependencies
npm install

# Initialize the database with sample data
npm run init-db

# Start the server
npm start

# Or run in development mode with auto-reload
npm run dev
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products (supports filtering by price and stock)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id/stock` - Update product stock
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders (supports filtering by user and status)
- `GET /api/orders/:id` - Get order by ID with items
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/summary` - Get order statistics

## Refactoring Goals

During the demo, this application will be refactored to:

1. **Implement Repository Pattern**
   - Create a `repositories/` folder
   - Move all database logic to repository classes
   - Separate data access from business logic

2. **Create a Database Connection Manager**
   - Single database connection instance
   - Proper connection pooling
   - Error handling

3. **Improve Code Organization**
   - Separate concerns (routes, business logic, data access)
   - Remove duplicate code
   - Consistent error handling

4. **Add Service Layer** (optional)
   - Business logic in service classes
   - Routes become thin controllers
   - Better testability

## Testing the Application

You can test the API using curl or any HTTP client:

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "New Product", "price": 49.99, "stock": 100}'

# Create an order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "items": [{"productId": 1, "quantity": 2}]}'
```

## Demo Script Usage

This application is designed to demonstrate the difference between AI assistants and autonomous agents:

1. **Assistant Demo**: Use Claude Code, Aider, or GitHub Copilot Chat to refactor the codebase interactively
2. **Agent Demo**: Create a GitHub issue describing the refactoring task and assign it to GitHub Copilot Coding Agent

The key teaching points:
- Assistants require interaction and review at each step
- Agents work autonomously after delegation
- Both have their place in the development workflow

## Notes for Instructors

- The code intentionally contains anti-patterns to make the refactoring demo more impactful
- The database is SQLite for simplicity (no external dependencies)
- The `.gitignore` excludes the database file so each participant starts fresh
- Transaction handling in the orders route is intentionally complex to show multi-file refactoring capabilities
- Error handling is basic to keep the focus on structure rather than edge cases