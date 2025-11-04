const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const {
  createUserValidation,
  updateUserValidation,
  getUserValidation,
  handleValidationErrors,
  rateLimit
} = require('../middleware/validation');

// Direct database connection in route file (anti-pattern)
const dbPath = path.join(__dirname, '..', '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// GET all users - database logic directly in route
router.get('/', (req, res) => {
  const sql = 'SELECT id, username, email, created_at FROM users';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(rows);
  });
});

// GET user by ID - database logic directly in route
router.get('/:id', getUserValidation, handleValidationErrors, (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  });
});

// POST create new user - database logic directly in route
router.post('/', rateLimit, createUserValidation, handleValidationErrors, (req, res) => {
  const { username, email, password } = req.body;
  
  // Remove manual validation as it's now handled by middleware
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  
  db.run(sql, [username, email, password], function(err) {
    if (err) {
      console.error('Error creating user:', err);
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    // Fetch the created user
    const getUserSql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    db.get(getUserSql, [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created user:', err);
        return res.status(500).json({ error: 'User created but failed to fetch' });
      }
      res.status(201).json(row);
    });
  });
});

// PUT update user - database logic directly in route
router.put('/:id', rateLimit, updateUserValidation, handleValidationErrors, (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  
  // Updated validation: at least one field must be provided
  if (!username && !email) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: [{ field: 'body', message: 'At least one field (username or email) must be provided' }]
    });
  }
  
  let sql = 'UPDATE users SET ';
  const params = [];
  
  if (username) {
    sql += 'username = ?, ';
    params.push(username);
  }
  if (email) {
    sql += 'email = ?, ';
    params.push(email);
  }
  
  sql = sql.slice(0, -2) + ' WHERE id = ?';
  params.push(id);
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error updating user:', err);
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      return res.status(500).json({ error: 'Failed to update user' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch updated user
    const getUserSql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    db.get(getUserSql, [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated user:', err);
        return res.status(500).json({ error: 'User updated but failed to fetch' });
      }
      res.json(row);
    });
  });
});

// DELETE user - database logic directly in route
router.delete('/:id', getUserValidation, handleValidationErrors, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(204).send();
  });
});

module.exports = router;