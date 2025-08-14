# Prompt Templates for Iterative Refinement

This file contains the exact prompts to use for each iteration of the exercise. Copy these into GitHub Copilot comments or paste into ChatGPT/Claude.

## Iteration 1: Vague Prompt

```
validate email
```

or

```
write a function to validate email
```

## Iteration 2: Add Requirements

```
Create a function called validateEmail that:
- Takes an email string as input
- Returns an object with {valid: boolean, error?: string}
- Checks for proper email format
- Handles null/undefined inputs
- Includes JSDoc comments
```

## Iteration 3: Add Examples and Edge Cases

```
Create a robust email validation function

Requirements:
- Function name: validateEmail
- Input: email (string)
- Output: {valid: boolean, error?: string, sanitized?: string}
- Use comprehensive regex for RFC 5322 compliance
- Handle international domains
- Trim whitespace and lowercase the email
- Maximum length: 254 characters
- Check for common typos (..com, .con)

Examples:
validateEmail('user@example.com') => {valid: true, sanitized: 'user@example.com'}
validateEmail('USER@EXAMPLE.COM  ') => {valid: true, sanitized: 'user@example.com'}
validateEmail('invalid.email') => {valid: false, error: 'Missing @ symbol'}
validateEmail('user@domain..com') => {valid: false, error: 'Invalid domain format'}
validateEmail('') => {valid: false, error: 'Email is required'}
```

## Part 4: Apply Pattern to Phone Validation

### Start Simple
```
validate phone number
```

### Add Requirements
```
Create validatePhone function that:
- Accepts phone numbers in various formats
- Returns {valid: boolean, error?: string, formatted?: string}
- Handles international numbers
- Validates length (7-15 digits)
- Removes non-numeric characters for validation
```

### Add Examples
```
Create validatePhone function

Requirements:
- Handle international formats
- Return {valid: boolean, error?: string, formatted?: string}
- Support country codes (+1, +44, etc.)
- Remove non-numeric characters for validation
- Validate length: 7-15 digits

Examples:
validatePhone('+1-555-555-5555') => {valid: true, formatted: '+15555555555'}
validatePhone('(555) 555-5555') => {valid: true, formatted: '5555555555'}
validatePhone('+44 20 7123 4567') => {valid: true, formatted: '+442071234567'}
validatePhone('12345') => {valid: false, error: 'Phone number too short'}
validatePhone('') => {valid: false, error: 'Phone number is required'}
```

## Credit Card Validation Template

```
Create validateCreditCard function

Requirements:
- Validate credit card numbers using Luhn algorithm
- Accept numbers with or without spaces/dashes
- Return {valid: boolean, error?: string, type?: string}
- Identify card type (Visa, MasterCard, Amex, Discover)
- Check length based on card type

Examples:
validateCreditCard('4532015112830366') => {valid: true, type: 'Visa'}
validateCreditCard('4532 0151 1283 0366') => {valid: true, type: 'Visa'}
validateCreditCard('5500005555555559') => {valid: true, type: 'MasterCard'}
validateCreditCard('371449635398431') => {valid: true, type: 'Amex'}
validateCreditCard('4532015112830367') => {valid: false, error: 'Invalid card number (Luhn check failed)'}
validateCreditCard('123') => {valid: false, error: 'Invalid card length'}
```

## Password Strength Validation Template

```
Create validatePassword function

Requirements:
- Check password strength
- Return {valid: boolean, strength: string, suggestions?: string[]}
- Minimum 8 characters
- Check for uppercase, lowercase, numbers, special characters
- Provide helpful suggestions for improvement

Strength levels:
- weak: < 8 chars or only one character type
- moderate: 8+ chars with 2-3 character types
- strong: 8+ chars with all 4 character types

Examples:
validatePassword('password') => {valid: false, strength: 'weak', suggestions: ['Add uppercase', 'Add numbers', 'Add special characters']}
validatePassword('Password1') => {valid: true, strength: 'moderate', suggestions: ['Add special characters']}
validatePassword('P@ssw0rd!') => {valid: true, strength: 'strong'}
validatePassword('abc') => {valid: false, strength: 'weak', suggestions: ['Minimum 8 characters required']}
```

## Tips for Using These Prompts

1. **With GitHub Copilot**: Type these as comments, Copilot will generate code below
2. **With ChatGPT/Claude**: Copy and paste the entire prompt
3. **Observe the progression**: Notice how each iteration improves the output
4. **Customize for your needs**: Adapt these patterns for your specific requirements
5. **Save successful patterns**: Keep templates that work well for reuse