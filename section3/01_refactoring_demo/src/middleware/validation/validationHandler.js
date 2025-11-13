const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Returns 400 Bad Request with detailed field errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      details: formattedErrors
    });
  }
  
  next();
};

module.exports = { handleValidationErrors };
