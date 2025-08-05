# Currency Formatter - Instructions

## Exercise: Generate a Currency Formatter Utility Function

**Goal**: Practice prompt engineering fundamentals by creating a utility function using AI assistance

---

## Your Task

Create a `formatCurrency` utility function that meets professional standards for a production application.

### Core Requirements
- **Function Name**: `formatCurrency`
- **Input**: Number (amount) and currency code (e.g., 'USD', 'EUR', 'GBP')
- **Output**: Properly formatted currency string
- Support multiple currencies (USD, EUR, GBP minimum)
- Handle edge cases: null/undefined inputs, invalid currency codes, very large numbers, negative amounts, zero values, non-numeric inputs
- Include comprehensive error handling and input validation
- Follow Python best practices with type hints and docstrings

---

## Instructions

1. **Customize the prompt template** in `prompt-template.txt` with your specific requirements
2. **Submit your prompt** to your chosen AI tool (GitHub Copilot, Claude Code, etc.)
3. **Review and iterate** on the generated code
4. **Test the function** by running it with various inputs including edge cases (manual testing with print statements)

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