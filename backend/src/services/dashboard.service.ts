import { count, sum, eq, ne } from "drizzle-orm";

import { db } from "../config/db";
import { categories as categoryTable } from "../models/category.model";
import { orders as orderTable } from "../models/orders.model";
import { orderItems as orderItemsTable } from "../models/orderItems.model";
import { products as productTable } from "../models/product.model";
import { users as userTable } from "../models/user.model";

export const get_DashboardData = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });

  if (!user) {
    const err = new Error("User not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  if (user.role !== "admin") {
    const err = new Error("Forbidden: admin role required") as Error & {
      status?: number;
    };
    err.status = 403;
    throw err;
  }

  const [
    totalUsersRes,
    totalOrdersRes,
    totalProductsRes,
    totalCategoriesRes,
    totalRevenueRes,
  ] = await Promise.all([
    db
      .select({ total: count() })
      .from(userTable)
      .where(ne(userTable.id, userId)),
    db
      .select({ total: count() })
      .from(orderTable)
      .where(ne(orderTable.user_id, userId)),
    db.select({ total: count() }).from(productTable),
    db.select({ total: count() }).from(categoryTable),
    db.select({ total: sum(orderItemsTable.price) }).from(orderItemsTable),
  ]);

  return {
    totalUsers: totalUsersRes[0]?.total ?? 0,
    totalOrders: totalOrdersRes[0]?.total ?? 0,
    totalProducts: totalProductsRes[0]?.total ?? 0,
    totalCategories: totalCategoriesRes[0]?.total ?? 0,
    totalRevenue: Number(totalRevenueRes[0]?.total ?? 0),
  };
};
