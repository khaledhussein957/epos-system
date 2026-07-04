import {
  pgTable,
  integer,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

import { products } from "./product.model";
import { users } from "./user.model";

export const stockAdjustments = pgTable(
  "stock_adjustments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),

    delta: integer("delta").notNull(),
    reason: text("reason"),
    stock_after: integer("stock_after").notNull(),

    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdIdx: index("stock_adjustments_product_id_idx").on(table.product_id),
    createdAtIdx: index("stock_adjustments_created_at_idx").on(table.created_at),
  }),
);
