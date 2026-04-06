import { pgTable, uuid, integer, index, timestamp } from "drizzle-orm/pg-core";

import { orders } from "./orders.model";
import { products } from "./product.model";

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    order_id: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id),

    quantity: integer("quantity").notNull(),
    price: integer("price"),

    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    orderIdIdx: index("order_items_order_id_idx").on(table.order_id),
    productIdIdx: index("order_items_product_id_idx").on(table.product_id),
  }),
);
