# Currency Formatter - Instructions

## Exercise: Generate a Currency Formatter Utility Function in TypeScript

**Goal**: Practice prompt engineering fundamentals by creating a utility function using AI assistance

---

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run tests to see requirements:**
   ```bash
   npm test
   ```
   You'll see 21 failing tests that define the exact requirements.

---

## Your Task

Generate the implementation for the `formatCurrency` function in `src/currencyFormatter.ts`.

### Core Requirements
- **Function Name**: `formatCurrency`
- **Input**: `amount` (number) and `currencyCode` (string)
- **Output**: Properly formatted currency string
- Support USD, EUR, and GBP currencies
- Handle edge cases: null/undefined inputs, invalid currency codes, negative amounts, zero values, non-numeric inputs, very large numbers
- Include comprehensive error handling and input validation
- Use TypeScript types properly
- Use the `Intl.NumberFormat` API for formatting

---

## Instructions

1. **Review the skeleton code** in `src/currencyFormatter.ts`
2. **Customize the prompt template** in `prompt-template.txt` using the CLEAR framework
3. **Submit your prompt** to your chosen AI tool:
   - GitHub Copilot (in your IDE)
   - ChatGPT/Claude (web interface)
   - Claude Code (command line)
4. **Replace the skeleton code** with the AI-generated implementation
5. **Run tests to verify:** `npm test`
6. **Iterate if needed** - refine your prompt if tests fail

Remember: The goal isn't perfect code on the first try, but learning how to effectively collaborate with AI tools!

---

## Extension Challenges

If you finish the core exercise early, try these advanced challenges:

1. **Add locale support**: Make the function accept a locale parameter for region-specific formatting
   ```python
   formatCurrency(1234.56, 'USD', locale='en-US') → '$1,234.56'
   formatCurrency(1234.56, 'USD', locale='de-DE') → '1.234,56 $'
   ```

2. **Add more currencies**: Extend support to JPY, CAD, AUD, and handle currencies with different decimal places

3. **Create comprehensive tests**: Write unit tests covering all edge cases and currency combinations

4. **Add configuration options**: Allow customizing decimal places, rounding behavior, and display format

5. **Performance optimization**: Optimize the function for high-frequency usage (think caching, efficient formatting)

6. **Create a currency conversion feature**: Integrate with a currency API to convert between currencies before formatting

These extensions will help you practice more advanced prompt engineering techniques and explore how AI handles complex, multi-faceted requirements!