import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";

import { categories } from "./catgory.model";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),

  description: text("description").notNull(),

  category_id: uuid("category_id").notNull().references(() => categories.id),

  price: integer("price").notNull(),

  stock: integer("stock").notNull(),

  is_active: boolean("is_active").default(true).notNull(),

  image_url: text("image_url").notNull(),

  qr_code: text("qr_code").notNull(),

  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdIdx: index("products_category_id_idx").on(table.category_id),
  createdAtIdx: index("products_created_at_idx").on(table.created_at),
}));
