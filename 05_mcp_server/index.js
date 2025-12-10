#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
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
    const dataDir = path.join(__dirname, "data");

    userData = JSON.parse(
      await fs.readFile(path.join(dataDir, "users.json"), "utf-8")
    );
    productData = JSON.parse(
      await fs.readFile(path.join(dataDir, "products.json"), "utf-8")
    );
    companyData = JSON.parse(
      await fs.readFile(path.join(dataDir, "companies.json"), "utf-8")
    );
    addressData = JSON.parse(
      await fs.readFile(path.join(dataDir, "addresses.json"), "utf-8")
    );
    transactionData = JSON.parse(
      await fs.readFile(path.join(dataDir, "transactions.json"), "utf-8")
    );

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
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [],
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
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
