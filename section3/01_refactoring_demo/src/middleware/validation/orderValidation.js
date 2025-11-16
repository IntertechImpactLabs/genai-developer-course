const { body, param, query } = require('express-validator');

/**
 * Validation rules for order-related endpoints
 */

// Order creation validation
const validateOrderCreation = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
    .toInt(),
  
  body('items')
    .notEmpty().withMessage('Items array is required')
    .isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  
  body('items.*.productId')
    .notEmpty().withMessage('Product ID is required for each item')
    .isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
    .toInt(),
  
  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required for each item')
    .isInt({ min: 1, max: 1000 }).withMessage('Quantity must be a positive integer between 1 and 1000')
    .toInt()
];

// Order status update validation
const validateStatusUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Order ID must be a positive integer'),
  
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, processing, shipped, delivered, cancelled')
];

// Order query parameters validation
const validateOrderQuery = [
  query('userId')
    .optional()
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
    .toInt(),
  
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, processing, shipped, delivered, cancelled')
];

// Order ID parameter validation
const validateOrderId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Order ID must be a positive integer')
];

module.exports = {
  validateOrderCreation,
  validateStatusUpdate,
  validateOrderQuery,
  validateOrderId
};
