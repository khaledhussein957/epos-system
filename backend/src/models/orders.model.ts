import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

import { users } from "./user.model";
import { customers } from "./customers.model";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  user_id: uuid("user_id").notNull().references(() => users.id),
  customer_id: uuid("customer_id").notNull().references(() => customers.id),

  total: text("total").notNull(),

  payment_method: text("payment_method").notNull(),

  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.user_id),
  customerIdIdx: index("orders_customer_id_idx").on(table.customer_id),
  createdAtIdx: index("orders_created_at_idx").on(table.created_at),
}));
