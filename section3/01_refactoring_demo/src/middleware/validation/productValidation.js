const { body, param, query } = require('express-validator');

/**
 * Validation rules for product-related endpoints
 */

// Product creation validation
const validateProductCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 1, max: 255 }).withMessage('Product name must be between 1 and 255 characters')
    .escape(), // Escape HTML entities
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
    .escape(), // Escape HTML entities
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0, max: 999999.99 }).withMessage('Price must be a positive number and not exceed 999,999.99')
    .toFloat(),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    .toInt()
];

// Product stock update validation
const validateStockUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
    .toInt(),
  
  body('operation')
    .notEmpty().withMessage('Operation is required')
    .isIn(['add', 'subtract']).withMessage('Operation must be either "add" or "subtract"')
];

// Product query parameters validation
const validateProductQuery = [
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum price must be a non-negative number')
    .toFloat(),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum price must be a non-negative number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
        throw new Error('Maximum price must be greater than or equal to minimum price');
      }
      return true;
    }),
  
  query('inStock')
    .optional()
    .isIn(['true', 'false']).withMessage('inStock must be either "true" or "false"')
];

// Product ID parameter validation
const validateProductId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
];

module.exports = {
  validateProductCreation,
  validateStockUpdate,
  validateProductQuery,
  validateProductId
};
