export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  locale: string = "en-US"
): string {
  try {
    // Validate inputs
    if (typeof amount !== "number" || isNaN(amount)) {
      throw new Error("Amount must be a valid number");
    }

    if (typeof currencyCode !== "string" || currencyCode.trim() === "") {
      throw new Error("Currency code must be a non-empty string");
    }

    // Format the currency using Intl.NumberFormat
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    });

    return formatter.format(amount);
  } catch (error) {
    // Handle invalid currency codes or other formatting errors
    if (error instanceof Error) {
      throw new Error(`Failed to format currency: ${error.message}`);
    }
    throw error;
  }
}
