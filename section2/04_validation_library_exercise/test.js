/**
 * Test Suite for Validation Library
 * 
 * Run this file to test your validation functions:
 * node test.js
 */

// Import your validation functions (update path if needed)
// For this exercise, we'll assume functions are in the same file
// In production, you'd import from validation.js

// Simple test runner
function runTests(validator, testCases, validatorName) {
    console.log(`\n🧪 Testing ${validatorName}:`);
    console.log('─'.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach((testCase, index) => {
        try {
            const result = validator(testCase.input);
            const testPassed = 
                result.valid === testCase.expected.valid &&
                (testCase.expected.error ? result.error !== undefined : true);
            
            if (testPassed) {
                console.log(`✅ Test ${index + 1}: "${testCase.description}"`);
                passed++;
            } else {
                console.log(`❌ Test ${index + 1}: "${testCase.description}"`);
                console.log(`   Input: ${JSON.stringify(testCase.input)}`);
                console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
                console.log(`   Got: ${JSON.stringify(result)}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ Test ${index + 1}: "${testCase.description}" - Error: ${error.message}`);
            failed++;
        }
    });
    
    console.log('─'.repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed\n`);
    return failed === 0;
}

// Test cases for validateEmail
const emailTestCases = [
    {
        description: "Valid email",
        input: "user@example.com",
        expected: { valid: true }
    },
    {
        description: "Valid email with uppercase",
        input: "USER@EXAMPLE.COM",
        expected: { valid: true }
    },
    {
        description: "Valid email with whitespace",
        input: "  user@example.com  ",
        expected: { valid: true }
    },
    {
        description: "Missing @ symbol",
        input: "invalid.email",
        expected: { valid: false, error: true }
    },
    {
        description: "Empty string",
        input: "",
        expected: { valid: false, error: true }
    },
    {
        description: "Null input",
        input: null,
        expected: { valid: false, error: true }
    },
    {
        description: "Undefined input",
        input: undefined,
        expected: { valid: false, error: true }
    },
    {
        description: "Double dots in domain",
        input: "user@domain..com",
        expected: { valid: false, error: true }
    },
    {
        description: "Common typo .con",
        input: "user@example.con",
        expected: { valid: false, error: true }
    },
    {
        description: "Very long email (over 254 chars)",
        input: "a".repeat(250) + "@test.com",
        expected: { valid: false, error: true }
    }
];

// Test cases for validatePhone (if implemented)
const phoneTestCases = [
    {
        description: "Valid US phone with country code",
        input: "+1-555-555-5555",
        expected: { valid: true }
    },
    {
        description: "Valid US phone with parentheses",
        input: "(555) 555-5555",
        expected: { valid: true }
    },
    {
        description: "Valid UK phone",
        input: "+44 20 7123 4567",
        expected: { valid: true }
    },
    {
        description: "Too short",
        input: "12345",
        expected: { valid: false, error: true }
    },
    {
        description: "Empty string",
        input: "",
        expected: { valid: false, error: true }
    }
];

// Test cases for validateCreditCard (if implemented)
const creditCardTestCases = [
    {
        description: "Valid Visa",
        input: "4532015112830366",
        expected: { valid: true }
    },
    {
        description: "Valid Visa with spaces",
        input: "4532 0151 1283 0366",
        expected: { valid: true }
    },
    {
        description: "Invalid Luhn check",
        input: "4532015112830367",
        expected: { valid: false, error: true }
    },
    {
        description: "Too short",
        input: "123456789",
        expected: { valid: false, error: true }
    },
    {
        description: "Non-numeric",
        input: "abcd-efgh-ijkl-mnop",
        expected: { valid: false, error: true }
    }
];

// Main test execution
console.log('🚀 Validation Library Test Suite');
console.log('='.repeat(50));

// NOTE: Update these function calls based on what you've implemented
// Example usage (uncomment when functions are ready):

/*
// Test validateEmail if it exists
if (typeof validateEmail !== 'undefined') {
    runTests(validateEmail, emailTestCases, 'validateEmail');
} else {
    console.log('⚠️  validateEmail not found - skipping tests');
}

// Test validatePhone if it exists
if (typeof validatePhone !== 'undefined') {
    runTests(validatePhone, phoneTestCases, 'validatePhone');
} else {
    console.log('⚠️  validatePhone not found - skipping tests');
}

// Test validateCreditCard if it exists
if (typeof validateCreditCard !== 'undefined') {
    runTests(validateCreditCard, creditCardTestCases, 'validateCreditCard');
} else {
    console.log('⚠️  validateCreditCard not found - skipping tests');
}
*/

console.log('\n💡 Tip: Uncomment the test calls above once you\'ve implemented your validators!');
console.log('   You can also run individual tests by copying them into your validation.js file.\n');