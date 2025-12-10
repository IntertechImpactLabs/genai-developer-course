interface PrettyCashOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

/**
 * Formats a number as a currency string.
 *
 * @param amount - The number to format
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * prettyCash(1234.56)                          // "$1,234.56"
 * prettyCash(1234.56, { currency: 'EUR' })     // "€1,234.56"
 * prettyCash(1234.56, { locale: 'de-DE', currency: 'EUR' }) // "1.234,56 €"
 * prettyCash(1234)                             // "$1,234.00"
 * prettyCash(1234, { minimumFractionDigits: 0 }) // "$1,234"
 */

/**
 * Generated on Claude.ai using Opus 4.5.
 *
 * Prompt:
 * Create a TypeScript utility function named prettyCash to format numbers as currency strings.
 */
function prettyCash(amount: number, options: PrettyCashOptions = {}): string {
  const {
    currency = "USD",
    locale = "en-US",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    useGrouping = true,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
  }).format(amount);
}

export { prettyCash, PrettyCashOptions };
export default prettyCash;
