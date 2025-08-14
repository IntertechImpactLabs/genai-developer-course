#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load mock data files
let userData;
let productData;
let companyData;
let addressData;
let transactionData;

async function loadMockData() {
  try {
    const dataDir = path.join(__dirname, 'data');

    userData = JSON.parse(await fs.readFile(path.join(dataDir, 'users.json'), 'utf-8'));
    productData = JSON.parse(await fs.readFile(path.join(dataDir, 'products.json'), 'utf-8'));
    companyData = JSON.parse(await fs.readFile(path.join(dataDir, 'companies.json'), 'utf-8'));
    addressData = JSON.parse(await fs.readFile(path.join(dataDir, 'addresses.json'), 'utf-8'));
    transactionData = JSON.parse(await fs.readFile(path.join(dataDir, 'transactions.json'), 'utf-8'));

    console.error("Mock data files loaded successfully");
  } catch (error) {
    console.error("Error loading mock data files:", error);
    console.error("Make sure data files exist in the data/ directory");
    process.exit(1);
  }
}

// Create the MCP server instance
const server = new Server(
  {
    name: "mock-data-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// TODO: Define your mock data tools here
// You'll need to implement tools for:
// 1. generate_users - Generate mock user data
// 2. generate_products - Generate mock product data
// 3. generate_transactions - Generate mock transaction data
// 4. generate_api_response - Generate mock API responses

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // TODO: Add your tool definitions here
    // Example structure:
    {
      name: "generate_users",
      description: "Generate mock user data with realistic profiles",
      inputSchema: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description: "Number of users to generate (1-100)",
            minimum: 1,
            maximum: 100,
          },
          // TODO: Add more parameters (includeAddress, includeCompany)
        },
        required: ["count"],
      },
    },
    // TODO: Add more tools (products, transactions, api_response)
  ],
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "generate_users":
        // TODO: Implement generateUsers function
        return await generateUsers(args);

      // TODO: Add cases for other tools

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// Helper functions
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateAddress(useInternational = false) {
  const streetNumber = getRandomNumber(1, 9999);
  const streetName = getRandomItem(addressData.streetNames);
  const streetType = getRandomItem(addressData.streetTypes);

  if (useInternational) {
    const city = getRandomItem(addressData.cities.international);
    return {
      street: `${streetNumber} ${streetName} ${streetType}`,
      city: city.name,
      country: city.country,
      postalCode: city.postalCode
    };
  } else {
    const city = getRandomItem(addressData.cities.US);
    return {
      street: `${streetNumber} ${streetName} ${streetType}`,
      city: city.name,
      state: city.state,
      zip: `${city.zip.substring(0, 5)}${getRandomNumber(1000, 9999)}`
    };
  }
}

// TODO: Implement mock data generator functions

async function generateUsers(args) {
  // TODO: Implement user generation using the loaded data
  // Should return an object with content array containing generated users

  const users = [];
  const count = Math.min(args.count || 5, 100);

  // TODO: Generate users with data from userData:
  // - id (use crypto.randomUUID())
  // - firstName from userData.firstNames
  // - lastName from userData.lastNames
  // - email using name and userData.emailDomains
  // - age (18-80)
  // - createdAt
  // - Optional: address if args.includeAddress is true
  // - Optional: company info if args.includeCompany is true

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(users, null, 2),
      },
    ],
  };
}

// TODO: Implement generateProducts function
// async function generateProducts(args) { ... }

// TODO: Implement generateTransactions function
// async function generateTransactions(args) { ... }

// TODO: Implement generateApiResponse function
// async function generateApiResponse(args) { ... }

// Start the server
async function startServer() {
  // Load mock data first
  await loadMockData();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mock Data MCP Server started");
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});