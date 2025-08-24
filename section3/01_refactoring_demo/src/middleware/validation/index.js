const { handleValidationErrors, rateLimit } = require('./errorHandler');
const userValidation = require('./userValidation');
const productValidation = require('./productValidation');
const orderValidation = require('./orderValidation');

module.exports = {
  // Error handling middleware
  handleValidationErrors,
  rateLimit,
  
  // User validation schemas
  ...userValidation,
  
  // Product validation schemas
  ...productValidation,
  
  // Order validation schemas
  ...orderValidation
};