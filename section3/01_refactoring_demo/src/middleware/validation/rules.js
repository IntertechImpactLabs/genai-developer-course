const { body, param, query } = require('express-validator');

/**
 * Reusable validation rules for common field types
 */

// Email validation with RFC 5322 compliance and sanitization
const emailValidation = (fieldName = 'email') => {
  return body(fieldName)
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail({
      all_lowercase: true,
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false
    })
    .isLength({ max: 254 })
    .withMessage('Email must be less than 254 characters')
    .custom((value) => {
      // Check for common typos
      if (value.includes('..') || value.endsWith('.con')) {
        throw new Error('Invalid email format');
      }
      return true;
    });
};

// Password validation with complexity requirements
const passwordValidation = (fieldName = 'password') => {
  return body(fieldName)
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');
};

// Username validation with sanitization
const usernameValidation = (fieldName = 'username') => {
  return body(fieldName)
    .trim()
    .escape()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens');
};

// String validation with XSS sanitization
const stringValidation = (fieldName, options = {}) => {
  const { min = 1, max = 255, required = true } = options;
  let validation = body(fieldName).trim().escape();
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${fieldName} is required`);
  }
  
  return validation
    .isLength({ min, max })
    .withMessage(`${fieldName} must be between ${min} and ${max} characters`);
};

// Numeric validation with range checking
const numericValidation = (fieldName, options = {}) => {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, required = true } = options;
  let validation = body(fieldName);
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${fieldName} is required`);
  }
  
  return validation
    .isNumeric()
    .withMessage(`${fieldName} must be a number`)
    .custom((value) => {
      const num = parseFloat(value);
      if (num < min || num > max) {
        throw new Error(`${fieldName} must be between ${min} and ${max}`);
      }
      return true;
    });
};

// ID parameter validation
const idParamValidation = (fieldName = 'id') => {
  return param(fieldName)
    .isInt({ min: 1 })
    .withMessage(`${fieldName} must be a positive integer`)
    .toInt();
};

// Query parameter validation for pagination
const paginationValidation = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100')
      .toInt()
  ];
};

// Array validation for order items
const orderItemsValidation = () => {
  return body('items')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array')
    .custom((items) => {
      for (const item of items) {
        if (!item.productId || !item.quantity) {
          throw new Error('Each item must have productId and quantity');
        }
        if (!Number.isInteger(item.productId) || item.productId < 1) {
          throw new Error('productId must be a positive integer');
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new Error('quantity must be a positive integer');
        }
      }
      return true;
    });
};

// Enum validation for order status
const orderStatusValidation = () => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  return body('status')
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`);
};

// Date validation (ISO 8601 format)
const dateValidation = (fieldName, options = {}) => {
  const { required = false } = options;
  let validation = body(fieldName);
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    validation = validation.optional();
  }
  
  return validation
    .isISO8601()
    .withMessage(`${fieldName} must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)`)
    .toDate();
};

module.exports = {
  emailValidation,
  passwordValidation,
  usernameValidation,
  stringValidation,
  numericValidation,
  idParamValidation,
  paginationValidation,
  orderItemsValidation,
  orderStatusValidation,
  dateValidation
};