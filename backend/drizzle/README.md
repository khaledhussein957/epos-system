# Migrations

`0000_windy_wong.sql` is the baseline schema for the project. Before this, the project used `bun run db:push` to sync schema directly; now generated migration files live here.

## Money & quantity type change

The baseline encodes these column types:

| Table         | Column     | Type           |
| ------------- | ---------- | -------------- |
| `products`    | `price`    | `numeric(12,2)`|
| `products`    | `stock`    | `integer`      |
| `order_items` | `quantity` | `integer`      |
| `order_items` | `price`    | `numeric(12,2)`|

Previously these were `text` (price/stock/quantity) or `integer` storing cents (`order_items.price`). If you have an existing DB you want to keep, run this once before re-pointing to the new schema:

```sql
ALTER TABLE products ALTER COLUMN price TYPE numeric(12,2) USING price::numeric;
ALTER TABLE products ALTER COLUMN stock TYPE integer USING stock::integer;
ALTER TABLE products ALTER COLUMN stock SET DEFAULT 0;
ALTER TABLE order_items ALTER COLUMN quantity TYPE integer USING quantity::integer;
ALTER TABLE order_items ALTER COLUMN price TYPE numeric(12,2) USING (price::numeric / 100);
ALTER TABLE order_items ALTER COLUMN price SET NOT NULL;
```

For dev environments, dropping and recreating with the baseline migration is simpler.

## Workflow

- `bun run db:push` — push schema directly (dev, no migration files).
- `bunx drizzle-kit generate` — emit a new migration file for schema diffs.
- `bunx drizzle-kit migrate` — apply pending migrations (production path).
