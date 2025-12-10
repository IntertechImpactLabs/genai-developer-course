/**
 * Formats a value as currency with special handling for edge cases.
 *
 * @param value - The value to format (string, number, null, or undefined)
 * @returns Formatted currency string
 *
 * @example
 * prettyCash(1234.56)    // "$1,234.56"
 * prettyCash("500")      // "$500.00"
 * prettyCash(-100)       // "($100.00)"
 * prettyCash(2000000)    // "$$$$"
 * prettyCash(null)       // "--"
 * prettyCash(undefined)  // "--"
 * prettyCash(NaN)        // "--"
 */

/**
 * Generated on Claude.ai using Opus 4.5.
 *
 * Prompt:
 * Create a TypeScript utility function named prettyCash to format currency.
 *
 * Requirements
 * - Accept strings or numbers as input
 * - Display null, undefined, NaN as "--"
 * - Format negative numbers by wrapping in parentheses
 * - Handle amounts over 1,000,000 as "$$$$"
 */
export function prettyCash(value: string | number | null | undefined): string {
  // Handle null, undefined
  if (value === null || value === undefined) {
    return "--";
  }

  // Convert string to number if needed
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  // Handle NaN
  if (Number.isNaN(numValue)) {
    return "--";
  }

  // Handle amounts over 1,000,000 (absolute value)
  if (Math.abs(numValue) > 1_000_000) {
    return "$$$$";
  }

  // Check if negative
  const isNegative = numValue < 0;
  const absoluteValue = Math.abs(numValue);

  // Format the number as currency
  const formatted = absoluteValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Wrap negative numbers in parentheses
  return isNegative ? `(${formatted})` : formatted;
}

export default prettyCash;
