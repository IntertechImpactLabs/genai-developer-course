/**
 * Formats a value as currency with special handling for edge cases.
 *
 * @param value - The value to format (string, number, null, or undefined)
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 *
 * Special cases:
 * - null, undefined, NaN: returns "----"
 * - Negative numbers: wrapped in parentheses, e.g., "($100.00)"
 * - Amounts over 1,000,000: returns "$$$$"
 */

/**
 * Generated on Claude.ai using Opus 4.5.
 *
 * Prompt:
 * Create a TypeScript utility function named prettyCash to format currency.
 * Requirements
 * - Accept strings or numbers as input
 * - Handle multiple currencies and locales, default to en-US
 * - Display null, undefined, NaN as "----"
 * - Format negative numbers by wrapping in parentheses
 * - Handle amounts over 1,000,000 as "$$$$"
 */
export function prettyCash(
  value: string | number | null | undefined,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  // Handle null and undefined
  if (value === null || value === undefined) {
    return "----";
  }

  // Convert string to number if needed
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  // Handle NaN
  if (Number.isNaN(numericValue)) {
    return "----";
  }

  // Handle amounts over 1,000,000 (absolute value)
  if (Math.abs(numericValue) > 1_000_000) {
    return "$$$$";
  }

  // Format the absolute value
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  });

  const formattedValue = formatter.format(Math.abs(numericValue));

  // Wrap negative numbers in parentheses
  if (numericValue < 0) {
    return `(${formattedValue})`;
  }

  return formattedValue;
}
