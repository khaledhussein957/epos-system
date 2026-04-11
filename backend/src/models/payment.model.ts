import { pgTable, timestamp, uuid, pgEnum, numeric } from "drizzle-orm/pg-core";

import { users } from "./user.model";
import { orders } from "./orders.model";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "success",
  "failed",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "card",
  "mobile",
  "bank",
]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),

  paymentStatus: paymentStatusEnum("payment_status").notNull(),

  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  phoneNo: numeric("phone_no", { precision: 15, scale: 0 }),

  transactionId: numeric("transaction_id", { precision: 15, scale: 0 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
