const { query } = require('express-validator');
const {
  numericValidation,
  idParamValidation,
  orderItemsValidation,
  orderStatusValidation
} = require('./rules');

/**
 * Order validation schemas
 */

// Validation for creating a new order
const createOrderValidation = [
  numericValidation('userId', { min: 1 }),
  orderItemsValidation()
];

// Validation for updating order status
const updateOrderStatusValidation = [
  idParamValidation('id'),
  orderStatusValidation()
];

// Validation for getting order by ID
const getOrderValidation = [
  idParamValidation('id')
];

// Validation for order listing with filters
const getOrdersValidation = [
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('userId must be a positive integer')
    .toInt(),
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('status must be one of: pending, processing, shipped, delivered, cancelled')
];

module.exports = {
  createOrderValidation,
  updateOrderStatusValidation,
  getOrderValidation,
  getOrdersValidation
};