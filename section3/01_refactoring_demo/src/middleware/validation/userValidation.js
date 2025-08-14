const {
  emailValidation,
  passwordValidation,
  usernameValidation,
  idParamValidation
} = require('./rules');

/**
 * User validation schemas
 */

// Validation for creating a new user
const createUserValidation = [
  usernameValidation('username'),
  emailValidation('email'),
  passwordValidation('password')
];

// Validation for updating a user
const updateUserValidation = [
  idParamValidation('id'),
  usernameValidation('username').optional(),
  emailValidation('email').optional()
];

// Validation for user login (if needed in future)
const loginUserValidation = [
  emailValidation('email'),
  passwordValidation('password')
];

// Validation for getting user by ID
const getUserValidation = [
  idParamValidation('id')
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  loginUserValidation,
  getUserValidation
};