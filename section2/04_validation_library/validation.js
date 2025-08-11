/**
 * Validation Library - Iterative Prompt Refinement Exercise
 * 
 * This file is where you'll build your validation functions
 * using iterative prompt refinement with GitHub Copilot or
 * by copying code from ChatGPT/Claude.
 * 
 * Exercise Flow:
 * 1. Start with vague prompt: "validate email"
 * 2. Add requirements for better structure
 * 3. Add examples for production quality
 * 4. Apply pattern to other validators
 */

// ITERATION 1: Start here with a vague prompt
// Type this comment and let Copilot complete:
// validate email


// ITERATION 2: Add requirements
// Uncomment and use this more specific prompt:
/*
// Create a function called validateEmail that:
// - Takes an email string as input
// - Returns an object with {valid: boolean, error?: string}
// - Checks for proper email format
// - Handles null/undefined inputs
// - Includes JSDoc comments
*/


// ITERATION 3: Add examples and edge cases
// Uncomment and use this comprehensive prompt:
/*
// Create a robust email validation function
// 
// Requirements:
// - Function name: validateEmail
// - Input: email (string)
// - Output: {valid: boolean, error?: string, sanitized?: string}
// - Use comprehensive regex for RFC 5322 compliance
// - Handle international domains
// - Trim whitespace and lowercase the email
// - Maximum length: 254 characters
// - Check for common typos (..com, .con)
//
// Examples:
// validateEmail('user@example.com') => {valid: true, sanitized: 'user@example.com'}
// validateEmail('USER@EXAMPLE.COM  ') => {valid: true, sanitized: 'user@example.com'}
// validateEmail('invalid.email') => {valid: false, error: 'Missing @ symbol'}
// validateEmail('user@domain..com') => {valid: false, error: 'Invalid domain format'}
// validateEmail('') => {valid: false, error: 'Email is required'}
*/


// TEST YOUR VALIDATORS
// Uncomment these tests after creating your functions:
/*
console.log('Testing validateEmail:');
console.log(validateEmail('user@example.com'));
console.log(validateEmail('invalid.email'));
console.log(validateEmail(''));
console.log(validateEmail('USER@EXAMPLE.COM  '));
console.log(validateEmail('test@domain..com'));
*/


// PART 4: Apply the pattern to create more validators
// Try creating these using the same iterative approach:

// validatePhone - with international support
// Start vague, then add requirements, then add examples


// validateCreditCard - with Luhn algorithm
// Start vague, then add requirements, then add examples


// validatePassword - with strength requirements
// Start vague, then add requirements, then add examples


// REFLECTION QUESTIONS:
// 1. How many iterations did it take to get production-quality code?
// 2. Which additions (requirements vs examples) had the biggest impact?
// 3. What patterns would you reuse for other validation functions?
// 4. How would you template this for your team?