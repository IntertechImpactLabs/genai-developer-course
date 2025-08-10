// Simple Demo API - Starting point for rate limiter demo
// This is a basic Express API with login endpoint (no rate limiting yet)

const express = require('express');
const app = express();
app.use(express.json());

// Mock user database
const users = [
  { id: 1, email: 'user@example.com', password: 'password123' },
  { id: 2, email: 'admin@example.com', password: 'admin123' }
];

// Simple login endpoint (no rate limiting)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password required' 
    });
  }
  
  // Check credentials
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({ 
      success: true, 
      message: 'Login successful',
      userId: user.id 
    });
  } else {
    res.status(401).json({ 
      error: 'Invalid credentials' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Demo API running on http://localhost:${PORT}`);
  console.log(`Try: POST http://localhost:${PORT}/api/login`);
  console.log(`Body: { "email": "user@example.com", "password": "password123" }`);
});