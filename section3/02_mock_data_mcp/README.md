# MCP Mock Data Server - Starter Code

This is the starter code for the Section 3B MCP exercise. Your task is to complete the implementation of a Mock Data MCP server.

## Setup

Install dependencies:
```bash
npm install
```

## Your Task

Complete the implementation in `index.js`:

1. **Define the tools** in the `tools/list` handler:
   - `generate_users` - Generate user profiles with optional addresses
   - `generate_products` - Generate e-commerce products
   - `generate_transactions` - Generate financial transactions
   - `generate_api_response` - Generate mock API responses

2. **Implement the generator functions**:
   - `generateUsers(args)` - Create realistic user data
   - `generateProducts(args)` - Create product data by category
   - `generateTransactions(args)` - Create transaction records
   - `generateApiResponse(args)` - Create API response mocks

## Configuration

### For GitHub Copilot Chat

Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "mock-data": {
      "type": "stdio",
      "command": "node",
      "args": ["/workspaces/genai-developer-course/section3/02_mock_data_mcp/index.js"]
    }
  }
}
```

### For Claude Code

```bash
claude mcp add mock-data /workspaces/genai-developer-course/section3/02_mock_data_mcp/index.js
```

## Tips

- Helper functions are provided (getRandomItem, getRandomNumber, generateAddress)
- Use the loaded data from JSON files (userData, productData, etc.)
- Use `crypto.randomUUID()` for generating unique IDs
- Remember to handle the `count` parameter to limit results
- Return data as JSON strings in the content array
- Add proper error handling for invalid inputs

## Data Available

The following data is loaded from JSON files:
- `userData` - firstNames, lastNames, emailDomains, departments, jobTitles
- `productData` - categories with names, brands, adjectives
- `companyData` - prefixes, suffixes, industries, locations
- `addressData` - streetNames, streetTypes, US and international cities
- `transactionData` - types, statuses, merchants, currencies
