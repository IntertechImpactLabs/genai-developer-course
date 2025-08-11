# Section 2B Exercise: Iterative Prompt Refinement

## Building a Data Validation Library

This exercise teaches you how iterative prompt refinement dramatically improves code quality by progressively adding specificity, examples, and requirements to your prompts.

## Learning Objectives
- Experience the power of iterative prompt refinement
- Learn how specificity improves code generation
- Practice the CLEAR framework in real scenarios
- Build reusable validation functions through iteration
- Understand when to add examples vs requirements

## Prerequisites
- GitHub Copilot OR ChatGPT/Claude web access
- Basic JavaScript/TypeScript knowledge
- Text editor or IDE

## Setup Instructions

### Option 1: GitHub Copilot (Recommended)
1. Open your IDE with GitHub Copilot enabled
2. Create a new file: `validation.js` (or `.ts` for TypeScript)
3. Type prompts as comments, Copilot generates code

### Option 2: ChatGPT or Claude
1. Open [ChatGPT](https://chat.openai.com) or [Claude](https://claude.ai)
2. Copy prompts from the exercise
3. Copy generated code back to test

### Option 3: Local Development
```bash
npm init -y
# Create validation.js and follow along
```

## Exercise Structure

### Part 1: Start Vague (5 minutes)
- Begin with "validate email"
- Observe poor quality output
- Identify what's missing

### Part 2: Add Requirements (5 minutes)  
- Specify function signature
- Add error handling
- See improvement

### Part 3: Add Examples (7 minutes)
- Provide input/output examples
- Include edge cases
- Achieve production-ready code

### Part 4: Apply Pattern (3 minutes)
- Build additional validators
- Reuse successful patterns

## Key Concepts

### The Iteration Pattern
1. **Iteration 1**: Basic functionality (often inadequate)
2. **Iteration 2**: Add requirements and structure
3. **Iteration 3**: Include examples and edge cases
4. **Iteration 4**: Polish and optimize

### Why It Works
- **Vague prompts** produce vague code
- **Specific requirements** improve structure
- **Examples** guide behavior
- **Iteration** leads to production quality

## Testing Your Code

### Quick Test Suite
```javascript
// Test your validators
console.log(validateEmail('user@example.com'));
console.log(validateEmail('invalid.email'));
console.log(validateEmail(''));
console.log(validateEmail('USER@EXAMPLE.COM  '));
```

### Expected Output Structure
```javascript
{ valid: true, sanitized: 'user@example.com' }
{ valid: false, error: 'Missing @ symbol' }
{ valid: false, error: 'Email is required' }
{ valid: true, sanitized: 'user@example.com' }
```

## Success Criteria

Your final validation function should:
- ✅ Handle null/undefined inputs
- ✅ Validate RFC-compliant emails
- ✅ Sanitize inputs (trim, lowercase)
- ✅ Return structured responses
- ✅ Include helpful error messages
- ✅ Handle edge cases

## Extension Challenges

If you finish early:
1. Create `validatePhone()` with international support
2. Create `validateCreditCard()` with Luhn algorithm
3. Convert to TypeScript with proper types
4. Generate comprehensive unit tests

## Instructor Notes
- Emphasize the dramatic improvement through iterations
- Show side-by-side comparison of outputs
- Discuss how this pattern applies to all AI coding
- Connect to CLEAR framework from Section 2A