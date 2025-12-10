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
import { randomUUID } from "crypto";

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
          includeAddress: {
            type: "boolean",
            description: "Include a mailing address for each user",
            default: false,
          },
          includeCompany: {
            type: "boolean",
            description: "Include company/employment details for each user",
            default: false,
          },
          internationalAddress: {
            type: "boolean",
            description: "Use international address format instead of US format",
            default: false,
          },
        },
        required: ["count"],
      },
    },
    {
      name: "generate_products",
      description: "Generate mock product data across realistic categories",
      inputSchema: {
        type: "object",
        properties: {
          count: {
            type: "number",
            description: "Number of products to generate (1-100)",
            minimum: 1,
            maximum: 100,
          },
          category: {
            type: "string",
            description: "Optional category to restrict generation",
            enum: Object.keys(productData?.categories || {}),
          },
          includeInventory: {
            type: "boolean",
            description: "Include inventory quantity in results",
            default: false,
          },
          includeRating: {
            type: "boolean",
            description: "Include rating and review count",
            default: false,
          },
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
      case "generate_products":
        return await generateProducts(args);

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
  const count = Math.min(args?.count || 5, 100);
  const includeAddress = Boolean(args?.includeAddress);
  const includeCompany = Boolean(args?.includeCompany);
  const useInternational = Boolean(args?.internationalAddress);

  function sanitizeForEmail(str) {
    return String(str)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .toLowerCase();
  }

  function randomPastDate(daysBack = 3650) {
    const now = Date.now();
    const past = now - getRandomNumber(0, daysBack) * 24 * 60 * 60 * 1000;
    // Add some random time within the day
    const withTime = past - getRandomNumber(0, 24 * 60 * 60 * 1000);
    return new Date(withTime);
  }

  function generateCompany() {
    const name = `${getRandomItem(companyData.prefixes)} ${getRandomItem(companyData.suffixes)}`;
    return {
      id: randomUUID(),
      name,
      industry: getRandomItem(companyData.industries),
      type: getRandomItem(companyData.companyTypes),
      size: getRandomItem(companyData.sizes),
      location: {
        city: getRandomItem(companyData.locations.cities),
        country: getRandomItem(companyData.locations.countries),
      },
      values: [getRandomItem(companyData.values), getRandomItem(companyData.values)],
    };
  }

  const users = Array.from({ length: count }).map(() => {
    const firstName = getRandomItem(userData.firstNames);
    const lastName = getRandomItem(userData.lastNames);
    const domain = getRandomItem(userData.emailDomains);
    const local = `${sanitizeForEmail(firstName)}.${sanitizeForEmail(lastName)}`;
    const maybeNum = Math.random() < 0.15 ? getRandomNumber(1, 999) : '';
    const email = `${local}${maybeNum ? maybeNum : ''}@${domain}`;

    const createdAt = randomPastDate().toISOString();
    const age = getRandomNumber(18, 80);

    const user = {
      id: randomUUID(),
      firstName,
      lastName,
      email,
      age,
      createdAt,
    };

    if (includeAddress) {
      user.address = generateAddress(useInternational);
    }

    if (includeCompany) {
      const company = generateCompany();
      user.company = {
        id: company.id,
        name: company.name,
        industry: company.industry,
        type: company.type,
        size: company.size,
        location: company.location,
        department: getRandomItem(userData.departments),
        title: getRandomItem(userData.jobTitles),
        startDate: randomPastDate(365 * 5).toISOString(),
      };
    }

    return user;
  });

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
async function generateProducts(args) {
  const count = Math.min(args?.count || 5, 100);
  const includeInventory = Boolean(args?.includeInventory);
  const includeRating = Boolean(args?.includeRating);

  const categories = Object.keys(productData.categories || {});
  const isValidCategory = (c) => categories.includes(c);

  function pickCategory() {
    if (args?.category && isValidCategory(args.category)) return args.category;
    return getRandomItem(categories);
  }

  function priceForCategory(category) {
    switch (category) {
      case "electronics":
        return getRandomFloat(49, 1999, 2);
      case "clothing":
        return getRandomFloat(9, 199, 2);
      case "books":
        return getRandomFloat(4, 59, 2);
      case "food":
        return getRandomFloat(1, 49, 2);
      case "toys":
        return getRandomFloat(4, 299, 2);
      case "home":
        return getRandomFloat(9, 1999, 2);
      default:
        return getRandomFloat(5, 500, 2);
    }
  }

  function buildName(catKey, catData, brand) {
    const base = getRandomItem(catData.names);
    if (catData.adjectives && catData.adjectives.length) {
      const adj = getRandomItem(catData.adjectives);
      return `${brand ? brand + " " : ""}${adj} ${base}`;
    }
    if (catData.styles && catData.styles.length) {
      const style = getRandomItem(catData.styles);
      return `${brand ? brand + " " : ""}${style} ${base}`;
    }
    return `${brand ? brand + " " : ""}${base}`;
  }

  function brandForCategory(catData) {
    if (catData.brands && catData.brands.length) return getRandomItem(catData.brands);
    if (catData.publishers && catData.publishers.length) return getRandomItem(catData.publishers);
    return undefined;
  }

  const products = Array.from({ length: count }).map(() => {
    const category = pickCategory();
    const catData = productData.categories[category];

    const brand = brandForCategory(catData);
    const name = buildName(category, catData, brand);
    const price = priceForCategory(category);
    const condition = getRandomItem(productData.conditions);
    const material = getRandomItem(productData.materials);

    const product = {
      id: randomUUID(),
      name,
      category,
      brand,
      price,
      currency: "USD",
      condition,
      material,
      createdAt: new Date().toISOString(),
    };

    if (category === "books") {
      const authors = productData.categories.books.authors || [];
      if (authors.length) product.author = getRandomItem(authors);
      if (!brand && productData.categories.books.publishers?.length) {
        product.brand = getRandomItem(productData.categories.books.publishers);
      }
      // ISBN-like code
      product.isbn = `${getRandomNumber(1000000000000, 9999999999999)}`;
    }

    // SKU generation
    const prefix = (product.brand || category).replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase();
    product.sku = `${prefix}-${getRandomNumber(10000, 99999)}`;

    if (includeInventory) {
      product.inventory = {
        quantity: getRandomNumber(0, 500),
        restockDate: Math.random() < 0.2 ? new Date(Date.now() + getRandomNumber(3, 30) * 86400000).toISOString() : null,
      };
    }

    if (includeRating) {
      product.rating = {
        average: getRandomFloat(1, 5, 1),
        reviews: getRandomNumber(0, 2000),
      };
    }

    return product;
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(products, null, 2),
      },
    ],
  };
}

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