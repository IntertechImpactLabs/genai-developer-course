/**
 * Formats a number as a currency string.
 *
 * @param {number} amount - The number to format
 * @param {Object} options - Formatting options
 * @param {string} options.currency - Currency code (default: 'USD')
 * @param {string} options.locale - Locale for formatting (default: 'en-US')
 * @param {number} options.decimals - Number of decimal places (default: 2)
 * @param {boolean} options.showSymbol - Whether to show currency symbol (default: true)
 * @returns {string} Formatted currency string
 */

/**
 * Generated on Claude.ai using Opus 4.5
 * 
 * Prompt:
 * Create a utility function to format numbers as currency strings.
 * @param {*} amount 
 * @param {*} options 
 * @returns 
 */
function formatCurrency(amount, options = {}) {
  const {
    currency = 'USD',
    locale = 'en-US',
    decimals = 2,
    showSymbol = true,
  } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Invalid amount';
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(amount);
}

// Examples
console.log('Basic usage:');
console.log(formatCurrency(1234.56));                           // $1,234.56
console.log(formatCurrency(1000));                              // $1,000.00

console.log('\nDifferent currencies:');
console.log(formatCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' }));  // 1.234,56 €
console.log(formatCurrency(1234.56, { currency: 'GBP', locale: 'en-GB' }));  // £1,234.56
console.log(formatCurrency(1234.56, { currency: 'JPY', locale: 'ja-JP' }));  // ¥1,235

console.log('\nCustom decimals:');
console.log(formatCurrency(1234.5678, { decimals: 0 }));        // $1,235
console.log(formatCurrency(1234.5678, { decimals: 3 }));        // $1,234.568

console.log('\nWithout symbol:');
console.log(formatCurrency(1234.56, { showSymbol: false }));    // 1,234.56

console.log('\nEdge cases:');
console.log(formatCurrency(-500.25));                           // -$500.25
console.log(formatCurrency(0));                                 // $0.00
console.log(formatCurrency(NaN));                               // Invalid amount

module.exports = { formatCurrency };
