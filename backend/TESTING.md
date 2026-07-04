# Testing

The backend uses [Bun's built-in test runner](https://bun.com/docs/cli/test). Tests live next to the code they cover as `*.test.ts` files.

## Running

```bash
bun run test           # once
bun run test:watch     # watch mode
bun test src/utils     # a specific directory
bun test -t "hashes"   # a specific test name
```

## What's covered

### Pure / unit (no database needed)
- **`src/utils/AppError.test.ts`** — status + message plumbing
- **`src/utils/auth.util.test.ts`** — bcrypt round-trip, reset code entropy, refresh token generation + hashing, JWT round-trip, TTL constants
- **`src/validations/order.validate.test.ts`** — quantity coercion, empty cart, mobile / bank require `payment_account`, discount / tax non-negative
- **`src/validations/customer.validate.test.ts`** — name / email / phone rules, partial update semantics
- **`src/validations/product.validate.test.ts`** — barcode trim + length, category uuid, price / stock rules

That's the current 55-test suite (`bun test`). Everything runs in under 1 second.

## Adding integration tests

Service-layer tests that hit Postgres use the helper in `src/testing/db.ts`:

```ts
import { afterAll, describe, expect, test } from "bun:test";

import { closeTestPool, withTx } from "@/testing/db";
import { customers } from "@/models/customers.model";

describe("customer service", () => {
  afterAll(() => closeTestPool());

  test("inserts and reads back", () =>
    withTx(async (tx) => {
      const [row] = await tx
        .insert(customers)
        .values({
          name: "Jane",
          email: "jane@example.com",
          phone: "+2521",
        })
        .returning();
      expect(row.id).toBeDefined();
      // tx rolls back automatically — no cleanup needed
    }));
});
```

### Setup for integration tests

1. Provision a dedicated test database:
   ```bash
   createdb epos_test
   ```
2. Set `TEST_DATABASE_URL` in your shell (falls back to `DATABASE_URL` if unset — the helper refuses any URL containing `prod`):
   ```bash
   export TEST_DATABASE_URL=postgresql://localhost/epos_test
   ```
3. Apply the schema once (the helper doesn't run migrations for you):
   ```bash
   TEST_DATABASE_URL=$TEST_DATABASE_URL bun run db:migrate
   ```
4. Run the tests. Each `withTx` block opens a transaction and forces a rollback at the end, so no test leaks state.

## Not yet covered

- Route / controller integration (supertest against the Express app)
- Reports service (needs seeded fixtures — good candidate for the first integration test)
- Auth service session issuance (needs the users + refresh_tokens tables)
- Order service transactional flow (highest business value — worth writing next)

Contributions welcome — the patterns above are enough to write any of these.
