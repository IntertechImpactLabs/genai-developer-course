const { query } = require('express-validator');
const {
  stringValidation,
  numericValidation,
  idParamValidation
} = require('./rules');

/**
 * Product validation schemas
 */

// Validation for creating a new product
const createProductValidation = [
  stringValidation('name', { min: 1, max: 100 }),
  stringValidation('description', { min: 0, max: 500, required: false }),
  numericValidation('price', { min: 0.01, max: 999999.99 }),
  numericValidation('stock', { min: 0, max: 999999, required: false })
];

// Validation for updating product stock
const updateProductStockValidation = [
  idParamValidation('id'),
  numericValidation('quantity', { min: 1, max: 999999 }),
  stringValidation('operation').custom((value) => {
    if (!['add', 'subtract'].includes(value)) {
      throw new Error('Operation must be "add" or "subtract"');
    }
    return true;
  })
];

// Validation for getting product by ID
const getProductValidation = [
  idParamValidation('id')
];

// Validation for product listing with filters
const getProductsValidation = [
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a non-negative number')
    .toFloat(),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a non-negative number')
    .toFloat(),
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be true or false')
    .toBoolean()
];

module.exports = {
  createProductValidation,
  updateProductStockValidation,
  getProductValidation,
  getProductsValidation
};