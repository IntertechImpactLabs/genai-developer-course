const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy for production deployments behind reverse proxies
// This allows rate limiting to work correctly with X-Forwarded-For headers
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Database connection
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Import routes (with scattered database logic)
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only if this is the main module
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for testing
module.exports = { app, db };