import { and, desc, eq, gte, lte, sql, sum, count } from "drizzle-orm";

import { db } from "../config/db";
import { orders } from "../models/orders.model";
import { orderItems } from "../models/orderItems.model";
import { products } from "../models/product.model";
import { users } from "../models/user.model";
import { customers } from "../models/customers.model";
import { AppError } from "../utils/AppError";

type DateRange = { from?: Date; to?: Date };

const dateWindow = (range: DateRange) => {
  const clauses = [];
  if (range.from) clauses.push(gte(orders.created_at, range.from));
  if (range.to) clauses.push(lte(orders.created_at, range.to));
  return clauses.length ? and(...clauses) : undefined;
};

export const dailySales = async (range: DateRange) => {
  const day = sql<string>`to_char(${orders.created_at}, 'YYYY-MM-DD')`;

  const rows = await db
    .select({
      date: day,
      orderCount: count(orders.id),
      revenue: sum(orders.total),
    })
    .from(orders)
    .where(dateWindow(range))
    .groupBy(day)
    .orderBy(desc(day));

  return rows.map((r) => ({
    date: r.date,
    orderCount: Number(r.orderCount ?? 0),
    revenue: Number(r.revenue ?? 0),
  }));
};

export const topProducts = async (range: DateRange, limit: number) => {
  const quantitySold = sum(orderItems.quantity);
  const revenue = sum(sql`${orderItems.price} * ${orderItems.quantity}`);

  const rows = await db
    .select({
      productId: products.id,
      name: products.name,
      imageUrl: products.image_url,
      quantitySold,
      revenue,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.order_id, orders.id))
    .innerJoin(products, eq(orderItems.product_id, products.id))
    .where(dateWindow(range))
    .groupBy(products.id, products.name, products.image_url)
    .orderBy(desc(quantitySold))
    .limit(limit);

  return rows.map((r) => ({
    productId: r.productId,
    name: r.name,
    imageUrl: r.imageUrl,
    quantitySold: Number(r.quantitySold ?? 0),
    revenue: Number(r.revenue ?? 0),
  }));
};

export const lowStock = async (threshold: number) => {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      imageUrl: products.image_url,
      stock: products.stock,
      price: products.price,
    })
    .from(products)
    .where(and(lte(products.stock, threshold), eq(products.is_active, true)))
    .orderBy(products.stock);

  return rows.map((r) => ({
    ...r,
    price: Number(r.price),
  }));
};

export const revenueByCashier = async (range: DateRange) => {
  const revenue = sum(orders.total);

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      orderCount: count(orders.id),
      revenue,
    })
    .from(orders)
    .innerJoin(users, eq(orders.user_id, users.id))
    .where(dateWindow(range))
    .groupBy(users.id, users.name, users.email, users.role)
    .orderBy(desc(revenue));

  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: r.email,
    role: r.role,
    orderCount: Number(r.orderCount ?? 0),
    revenue: Number(r.revenue ?? 0),
  }));
};

export const customerHistory = async (customerId: string) => {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const customerOrders = await db.query.orders.findMany({
    where: eq(orders.customer_id, customerId),
    with: {
      orderItems: { with: { product: true } },
    },
    orderBy: (o, { desc }) => [desc(o.created_at)],
  });

  const lifetimeSpend = customerOrders.reduce(
    (sum, o) => sum + Number(o.total),
    0,
  );

  return {
    customer,
    orderCount: customerOrders.length,
    lifetimeSpend,
    orders: customerOrders,
  };
};
