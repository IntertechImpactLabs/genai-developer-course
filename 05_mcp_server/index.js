#!/usr/bin/env node
/**
 * Mock Data MCP Server
 *
 * A Model Context Protocol server that provides tools for accessing mock data.
 * Runs via stdio transport for integration with MCP clients.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { loadMockData, mockData } from "./dataLoader.js";

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

// Register handler to list available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [],
}));

// Register handler for tool execution requests
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

// Start the server
async function main() {
  await loadMockData();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
