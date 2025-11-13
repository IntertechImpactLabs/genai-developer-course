const { body, param, query } = require('express-validator');

/**
 * Validation rules for user-related endpoints
 */

// User registration validation
const validateUserRegistration = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .escape(), // Escape HTML entities
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail() // Convert to lowercase and remove dots from Gmail addresses
    .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// User update validation
const validateUserUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .escape(),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters'),
  
  body()
    .custom((value, { req }) => {
      if (!req.body.username && !req.body.email) {
        throw new Error('At least one field (username or email) must be provided');
      }
      return true;
    })
];

// User ID parameter validation
const validateUserId = [
  param('id')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
];

module.exports = {
  validateUserRegistration,
  validateUserUpdate,
  validateUserId
};
