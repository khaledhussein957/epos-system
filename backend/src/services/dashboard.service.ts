import { count, sum, eq } from "drizzle-orm";

import { db } from "../config/db";
import { categories as categoryTable } from "../models/category.model";
import { orders as orderTable } from "../models/orders.model";
import { orderItems as orderItemsTable } from "../models/orderItems.model";
import { products as productTable } from "../models/product.model";
import { users as userTable } from "../models/user.model";

export const get_DashboardData = async (userId: string) => {
  // 1. Validate user
  const user = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });

  if (!user) {
    return { message: "User not found" };
  }

  if (user.role !== "admin") {
    return { message: "User is not authorized" };
  }

  // 2. Run all queries in parallel (FAST)
  const [
    totalUsersRes,
    totalOrdersRes,
    totalProductsRes,
    totalCategoriesRes,
    totalRevenueRes,
  ] = await Promise.all([
    db.select({ total: count() }).from(userTable),
    db.select({ total: count() }).from(orderTable),
    db.select({ total: count() }).from(productTable),
    db.select({ total: count() }).from(categoryTable),
    db.select({ total: sum(orderItemsTable.price) }).from(orderItemsTable),
  ]);

  // 3. Normalize results (handle nulls safely)
  return {
    totalUsers: totalUsersRes[0]?.total ?? 0,
    totalOrders: totalOrdersRes[0]?.total ?? 0,
    totalProducts: totalProductsRes[0]?.total ?? 0,
    totalCategories: totalCategoriesRes[0]?.total ?? 0,
    totalRevenue: Number(totalRevenueRes[0]?.total ?? 0),
  };
};
