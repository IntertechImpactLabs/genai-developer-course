const { handleValidationErrors } = require('./validationHandler');
const userValidation = require('./userValidation');
const productValidation = require('./productValidation');
const orderValidation = require('./orderValidation');

module.exports = {
  handleValidationErrors,
  ...userValidation,
  ...productValidation,
  ...orderValidation
};
