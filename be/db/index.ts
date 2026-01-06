import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/envs";

// Create a pg pool
const pool = new Pool({
  connectionString: config.db_url,
});

// Pass the pool to Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
export const prisma = new PrismaClient({
  adapter,
});
