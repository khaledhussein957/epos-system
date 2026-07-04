import { count, sum, eq, ne } from "drizzle-orm";

import { db } from "../config/db";
import { categories as categoryTable } from "../models/category.model";
import { orders as orderTable } from "../models/orders.model";
import { products as productTable } from "../models/product.model";
import { users as userTable } from "../models/user.model";
import { AppError } from "../utils/AppError";

export const get_DashboardData = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "admin") {
    throw new AppError("Forbidden: admin role required", 403);
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
    db.select({ total: sum(orderTable.total) }).from(orderTable),
  ]);

  return {
    totalUsers: totalUsersRes[0]?.total ?? 0,
    totalOrders: totalOrdersRes[0]?.total ?? 0,
    totalProducts: totalProductsRes[0]?.total ?? 0,
    totalCategories: totalCategoriesRes[0]?.total ?? 0,
    totalRevenue: Number(totalRevenueRes[0]?.total ?? 0),
  };
};
