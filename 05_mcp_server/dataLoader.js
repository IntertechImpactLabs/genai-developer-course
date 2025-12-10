import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data storage object
export const mockData = {
  users: null,
  products: null,
  companies: null,
  addresses: null,
  transactions: null,
};

export async function loadMockData() {
  try {
    const dataDir = path.join(__dirname, "data");

    mockData.users = JSON.parse(
      await fs.readFile(path.join(dataDir, "users.json"), "utf-8")
    );
    mockData.products = JSON.parse(
      await fs.readFile(path.join(dataDir, "products.json"), "utf-8")
    );
    mockData.companies = JSON.parse(
      await fs.readFile(path.join(dataDir, "companies.json"), "utf-8")
    );
    mockData.addresses = JSON.parse(
      await fs.readFile(path.join(dataDir, "addresses.json"), "utf-8")
    );
    mockData.transactions = JSON.parse(
      await fs.readFile(path.join(dataDir, "transactions.json"), "utf-8")
    );
  } catch (error) {
    console.error("Error loading mock data files:", error);
    process.exit(1);
  }
}
