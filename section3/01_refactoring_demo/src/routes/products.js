const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const {
  createProductValidation,
  updateProductStockValidation,
  getProductValidation,
  getProductsValidation,
  handleValidationErrors,
  rateLimit
} = require('../middleware/validation');

// Another direct database connection (duplicate code)
const dbPath = path.join(__dirname, '..', '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// GET all products with optional filtering - complex query logic in route
router.get('/', getProductsValidation, handleValidationErrors, (req, res) => {
  const { minPrice, maxPrice, inStock } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  
  if (minPrice) {
    sql += ' AND price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    sql += ' AND price <= ?';
    params.push(maxPrice);
  }
  if (inStock === 'true') {
    sql += ' AND stock > 0';
  }
  
  sql += ' ORDER BY name';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(rows);
  });
});

// GET product by ID with stock check - business logic mixed with data access
router.get('/:id', getProductValidation, handleValidationErrors, (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM products WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Business logic mixed with data access
    row.inStock = row.stock > 0;
    row.lowStock = row.stock > 0 && row.stock < 10;
    
    res.json(row);
  });
});

// POST create new product - validation and database logic mixed
router.post('/', rateLimit, createProductValidation, handleValidationErrors, (req, res) => {
  const { name, description, price, stock } = req.body;
  
  // Remove manual validation as it's now handled by middleware
  const sql = 'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)';
  const productStock = stock || 0;
  
  db.run(sql, [name, description, price, productStock], function(err) {
    if (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }
    
    // Fetch created product
    const getProductSql = 'SELECT * FROM products WHERE id = ?';
    db.get(getProductSql, [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created product:', err);
        return res.status(500).json({ error: 'Product created but failed to fetch' });
      }
      res.status(201).json(row);
    });
  });
});

// PUT update product stock - transaction logic in route
router.put('/:id/stock', rateLimit, updateProductStockValidation, handleValidationErrors, (req, res) => {
  const { id } = req.params;
  const { quantity, operation } = req.body;
  
  // Remove manual validation as it's now handled by middleware
  // First get current stock
  const getStockSql = 'SELECT stock FROM products WHERE id = ?';
  
  db.get(getStockSql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching product stock:', err);
      return res.status(500).json({ error: 'Failed to fetch product stock' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const currentStock = row.stock;
    let newStock;
    
    if (operation === 'add') {
      newStock = currentStock + quantity;
    } else {
      newStock = currentStock - quantity;
      if (newStock < 0) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
    }
    
    // Update stock
    const updateSql = 'UPDATE products SET stock = ? WHERE id = ?';
    
    db.run(updateSql, [newStock, id], function(err) {
      if (err) {
        console.error('Error updating stock:', err);
        return res.status(500).json({ error: 'Failed to update stock' });
      }
      
      res.json({ 
        id: parseInt(id), 
        previousStock: currentStock, 
        newStock, 
        operation, 
        quantity 
      });
    });
  });
});

// DELETE product - check for existing orders before deletion
router.delete('/:id', getProductValidation, handleValidationErrors, (req, res) => {
  const { id } = req.params;
  
  // Check if product is in any orders
  const checkOrdersSql = 'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?';
  
  db.get(checkOrdersSql, [id], (err, row) => {
    if (err) {
      console.error('Error checking product orders:', err);
      return res.status(500).json({ error: 'Failed to check product orders' });
    }
    
    if (row.count > 0) {
      return res.status(409).json({ error: 'Cannot delete product that has been ordered' });
    }
    
    // Delete product
    const deleteSql = 'DELETE FROM products WHERE id = ?';
    
    db.run(deleteSql, [id], function(err) {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ error: 'Failed to delete product' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.status(204).send();
    });
  });
});

module.exports = router;