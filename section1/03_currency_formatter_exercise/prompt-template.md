Context: I'm building a [TYPE OF APPLICATION] that needs to display prices to international users

Language: TypeScript

Action: Create a formatCurrency utility function

Requirements:
- Function name: formatCurrency
- Parameters: amount (number), currencyCode (string)
- Return type: string
- Support currencies: USD, EUR, GBP
- Handle edge cases: [LIST YOUR SPECIFIC EDGE CASES]
- Use Intl.NumberFormat API for formatting
- Include TypeScript types and JSDoc comments
- Throw descriptive errors for invalid inputs

Example usage:
formatCurrency(1234.56, 'USD') → '$1,234.56'
formatCurrency(1234.56, 'EUR') → '€1,234.56'