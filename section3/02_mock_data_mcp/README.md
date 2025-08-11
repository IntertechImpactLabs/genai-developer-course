# MCP Mock Data Server - Starter Code

This is the starter code for the Section 3B MCP exercise. Your task is to complete the implementation of a Mock Data MCP server.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Run tests to verify your implementation:
```bash
npm test
```

## Your Task

Complete the implementation in `src/index.ts`:

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

3. **Write tests** in `tests/index.test.ts` to verify your implementation

## Development

```bash
# Run in development mode (TypeScript)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Watch mode for tests
npm run test:watch
```

## Configuration

After building your server:

### For GitHub Copilot Chat

Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "mock-data": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/02_mock_data_mcp/dist/index.js"]
    }
  }
}
```

### For Claude Code

```bash
claude mcp add mock-data /absolute/path/to/02_mock_data_mcp/dist/index.js
```

## Tips

- TypeScript types are provided for all function arguments
- Use the provided sample arrays (firstNames, lastNames, domains) for realistic data
- Use `crypto.randomUUID()` for generating unique IDs
- Remember to handle the `count` parameter to limit results
- Return data as JSON strings in the content array
- Add proper error handling for invalid inputs

## Testing

The test file includes placeholders for all the functions you need to implement. Write tests to ensure:
- Correct number of items generated
- Optional parameters work correctly
- Data validation and limits are enforced

## Need Help?

Refer to the complete implementation in the course materials `hands-on-exercise.md` if you get stuck!