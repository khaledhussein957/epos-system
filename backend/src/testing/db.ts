/**
 * Test helpers for service-level integration tests.
 *
 * Requires a real Postgres database. Point at a dedicated test DB via
 * TEST_DATABASE_URL (falls back to DATABASE_URL if unset — do NOT run against
 * production).
 *
 * Usage:
 *   import { withTx } from "@/testing/db";
 *
 *   test("creates a customer", () => withTx(async (tx) => {
 *     const [row] = await tx.insert(customers).values(...).returning();
 *     expect(row).toBeDefined();
 *     // rolls back automatically on return / throw
 *   }));
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { schema } from "../models/schema";

const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "TEST_DATABASE_URL (or DATABASE_URL) must be set for integration tests",
  );
}

if (url.includes("prod") || url.includes("production")) {
  throw new Error("Refusing to run tests against a URL containing 'prod'");
}

export const testPool = new Pool({ connectionString: url, max: 4 });
export const testDb = drizzle(testPool, { schema });

/**
 * Run `fn` inside a Drizzle transaction that is guaranteed to roll back
 * so no test can leak state into another. If `fn` throws, the error is
 * re-thrown after the rollback.
 */
export const withTx = async <T>(
  fn: (tx: Parameters<Parameters<typeof testDb.transaction>[0]>[0]) => Promise<T>,
): Promise<T> => {
  const marker = new Error("TEST_ROLLBACK");
  let result!: T;
  try {
    await testDb.transaction(async (tx) => {
      result = await fn(tx);
      // Force rollback by throwing a sentinel.
      throw marker;
    });
  } catch (err) {
    if (err !== marker) throw err;
  }
  return result;
};

/** Close the pool. Call this in a top-level afterAll if you use withTx. */
export const closeTestPool = () => testPool.end();
