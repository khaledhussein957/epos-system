import { relations } from "drizzle-orm";
import { users, UserRole } from "./user.model";
import { products } from "./product.model";
import { categories } from "./category.model";
import { orders } from "./orders.model";
import { orderItems } from "./orderItems.model";
import { customers } from "./customers.model";

export const schema = {
  users,
  UserRole,
  products,
  categories,
  orders,
  orderItems,
  customers,
};

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [orders.customer_id],
    references: [customers.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));
