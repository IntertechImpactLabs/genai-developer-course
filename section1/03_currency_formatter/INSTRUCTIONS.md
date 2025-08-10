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
- Use appropriate type annotations/hints (language dependent)
- Follow your language's best practices
- Include clear documentation/comments

---

## Instructions

1. **Choose your programming language** (JavaScript/TypeScript, Python, C#, or Go)
2. **Customize the prompt template** in `prompt-template.txt` using the CLEAR framework
3. **Submit your prompt** to your chosen AI tool:
   - GitHub Copilot (in your IDE)
   - ChatGPT/Claude (web interface)
   - Claude Code (command line)
4. **Review the generated code** - check if it meets all requirements
5. **Test the function** with various inputs including edge cases
6. **Iterate and improve** based on your testing results

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