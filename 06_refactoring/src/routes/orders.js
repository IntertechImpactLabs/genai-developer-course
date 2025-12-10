const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Yet another database connection (more duplicate code)
const dbPath = path.join(__dirname, '..', '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// GET all orders with user info - complex join query in route
router.get('/', (req, res) => {
  const { userId, status } = req.query;
  let sql = `
    SELECT 
      o.id,
      o.user_id,
      o.total,
      o.status,
      o.created_at,
      u.username,
      u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  
  if (userId) {
    sql += ' AND o.user_id = ?';
    params.push(userId);
  }
  if (status) {
    sql += ' AND o.status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY o.created_at DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(rows);
  });
});

// GET order by ID with items - multiple queries and data assembly in route
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // Get order with user info
  const orderSql = `
    SELECT 
      o.id,
      o.user_id,
      o.total,
      o.status,
      o.created_at,
      u.username,
      u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ?
  `;
  
  db.get(orderSql, [id], (err, order) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items
    const itemsSql = `
      SELECT 
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name as product_name,
        p.description as product_description
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    
    db.all(itemsSql, [id], (err, items) => {
      if (err) {
        console.error('Error fetching order items:', err);
        return res.status(500).json({ error: 'Failed to fetch order items' });
      }
      
      // Assemble response
      order.items = items;
      res.json(order);
    });
  });
});

// POST create new order - complex transaction logic in route
router.post('/', (req, res) => {
  const { userId, items } = req.body;
  
  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'User ID and items are required' });
  }
  
  // Begin transaction manually
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    let orderCreated = false;
    let orderId = null;
    let hasError = false;
    
    // Validate all products exist and have sufficient stock
    const productIds = items.map(item => item.productId);
    const placeholders = productIds.map(() => '?').join(',');
    const checkProductsSql = `SELECT id, price, stock FROM products WHERE id IN (${placeholders})`;
    
    db.all(checkProductsSql, productIds, (err, products) => {
      if (err || products.length !== productIds.length) {
        hasError = true;
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Invalid product IDs' });
      }
      
      // Check stock availability
      const productMap = {};
      products.forEach(p => productMap[p.id] = p);
      
      for (const item of items) {
        const product = productMap[item.productId];
        if (product.stock < item.quantity) {
          hasError = true;
          db.run('ROLLBACK');
          return res.status(400).json({ 
            error: `Insufficient stock for product ${item.productId}` 
          });
        }
      }
      
      if (!hasError) {
        // Calculate total
        let total = 0;
        items.forEach(item => {
          const product = productMap[item.productId];
          total += product.price * item.quantity;
        });
        
        // Create order
        const createOrderSql = 'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)';
        
        db.run(createOrderSql, [userId, total, 'pending'], function(err) {
          if (err) {
            hasError = true;
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to create order' });
          }
          
          orderId = this.lastID;
          
          // Insert order items and update stock
          let itemsProcessed = 0;
          
          items.forEach(item => {
            const product = productMap[item.productId];
            
            // Insert order item
            const insertItemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
            
            db.run(insertItemSql, [orderId, item.productId, item.quantity, product.price], (err) => {
              if (err && !hasError) {
                hasError = true;
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to create order items' });
              }
              
              // Update product stock
              const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
              
              db.run(updateStockSql, [item.quantity, item.productId], (err) => {
                if (err && !hasError) {
                  hasError = true;
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Failed to update stock' });
                }
                
                itemsProcessed++;
                
                // If all items processed successfully, commit
                if (itemsProcessed === items.length && !hasError) {
                  db.run('COMMIT', (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ error: 'Failed to commit transaction' });
                    }
                    
                    // Return created order
                    res.status(201).json({
                      id: orderId,
                      userId,
                      total,
                      status: 'pending',
                      itemCount: items.length
                    });
                  });
                }
              });
            });
          });
        });
      }
    });
  });
});

// PUT update order status - business rules in route
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: `Status must be one of: ${validStatuses.join(', ')}` 
    });
  }
  
  // Get current status
  const getCurrentStatusSql = 'SELECT status FROM orders WHERE id = ?';
  
  db.get(getCurrentStatusSql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching order status:', err);
      return res.status(500).json({ error: 'Failed to fetch order status' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const currentStatus = row.status;
    
    // Business rules for status transitions
    if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
      return res.status(400).json({ 
        error: `Cannot change status from ${currentStatus}` 
      });
    }
    
    if (currentStatus === 'shipped' && status === 'pending') {
      return res.status(400).json({ 
        error: 'Cannot move shipped order back to pending' 
      });
    }
    
    // Update status
    const updateSql = 'UPDATE orders SET status = ? WHERE id = ?';
    
    db.run(updateSql, [status, id], function(err) {
      if (err) {
        console.error('Error updating order status:', err);
        return res.status(500).json({ error: 'Failed to update order status' });
      }
      
      res.json({ 
        id: parseInt(id), 
        previousStatus: currentStatus, 
        newStatus: status 
      });
    });
  });
});

// GET order statistics - aggregation query in route
router.get('/stats/summary', (req, res) => {
  const statsSql = `
    SELECT 
      COUNT(*) as total_orders,
      COUNT(DISTINCT user_id) as unique_customers,
      SUM(total) as total_revenue,
      AVG(total) as average_order_value,
      status,
      COUNT(*) as count_by_status
    FROM orders
    GROUP BY status
  `;
  
  db.all(statsSql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching order stats:', err);
      return res.status(500).json({ error: 'Failed to fetch order statistics' });
    }
    
    // Process and format statistics
    const stats = {
      totalOrders: 0,
      uniqueCustomers: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      ordersByStatus: {}
    };
    
    if (rows.length > 0) {
      stats.totalOrders = rows.reduce((sum, row) => sum + row.count_by_status, 0);
      stats.uniqueCustomers = rows[0].unique_customers;
      stats.totalRevenue = rows.reduce((sum, row) => sum + (row.total_revenue || 0), 0);
      stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
      
      rows.forEach(row => {
        stats.ordersByStatus[row.status] = row.count_by_status;
      });
    }
    
    res.json(stats);
  });
});

module.exports = router;