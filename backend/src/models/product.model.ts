import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  index,
  decimal,
} from "drizzle-orm/pg-core";

import { categories } from "./category.model";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),

    category_id: uuid("category_id")
      .notNull()
      .references(() => categories.id),

    price: text("price").notNull(),
    stock: text("stock").notNull(),
    is_active: boolean("is_active").default(true).notNull(),
    image_url: text("image_url"),
    image_public_id: text("image_public_id"),
    qr_code: text("qr_code").notNull(),

    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    categoryIdIdx: index("products_category_id_idx").on(table.category_id),
  }),
);

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));
