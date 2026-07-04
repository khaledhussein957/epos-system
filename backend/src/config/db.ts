import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { ENV } from "./env";
import { logger } from "../utils/logger";

import { schema } from "../models/schema.ts";

if (!ENV.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// initialize PostgreSQL connection pool
export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,

  // 🔴 CRITICAL: limit connections
  max: 10, // Increased to 10 for stability during dev

  // ⏱ Connection handling
  connectionTimeoutMillis: 30_000, // Increased timeout
  idleTimeoutMillis: 30_000,

  // 🧠 Optional but recommended
  keepAlive: true,
});

// log when first connection is made
let logged = false;
pool.on("connect", () => {
  if (!logged) {
    logger.info("database pool ready");
    logged = true;
  }
});

pool.on("error", (err) => {
  logger.error({ err }, "database pool error");
});

export const db = drizzle(pool, { schema });
export { schema };