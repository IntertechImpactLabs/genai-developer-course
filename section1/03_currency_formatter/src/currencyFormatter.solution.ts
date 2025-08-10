/**
 * Currency Formatter - Sample Solution
 * This is what students should generate using AI assistance
 */

type SupportedCurrency = 'USD' | 'EUR' | 'GBP';

/**
 * Formats a numeric amount as a currency string
 * 
 * @param amount - The numeric amount to format
 * @param currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns The formatted currency string
 * @throws Error if the amount or currency code is invalid
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  // Validate amount parameter
  if (amount === null || amount === undefined) {
    throw new Error('Amount is required');
  }
  
  if (typeof amount !== 'number') {
    throw new Error('Amount must be a number');
  }
  
  if (isNaN(amount)) {
    throw new Error('Amount must be a valid number');
  }
  
  if (!isFinite(amount)) {
    throw new Error('Amount must be a valid number');
  }
  
  // Validate currency code parameter
  if (currencyCode === null || currencyCode === undefined) {
    throw new Error('Currency code is required');
  }
  
  if (typeof currencyCode !== 'string') {
    throw new Error('Currency code must be a string');
  }
  
  if (currencyCode === '') {
    throw new Error('Currency code is required');
  }
  
  // Check if currency is supported (case-insensitive)
  const supportedCurrencies: SupportedCurrency[] = ['USD', 'EUR', 'GBP'];
  const upperCurrency = currencyCode.toUpperCase();
  
  if (!supportedCurrencies.includes(upperCurrency as SupportedCurrency)) {
    throw new Error(`Unsupported currency: ${currencyCode}`);
  }
  
  // Format using Intl.NumberFormat API
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: upperCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    throw new Error(`Failed to format currency: ${(error as Error).message}`);
  }
}