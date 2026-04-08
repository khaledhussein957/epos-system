import { and, eq, ne } from "drizzle-orm";

import { db } from "../config/db";

import { categories as categoryTable } from "../models/category.model";

export const get_AllCategories = async () => {
  const categories = await db.query.categories.findMany();
  return categories;
};

export const create_Category = async (name: string) => {
  const existingCategory = await db.query.categories.findFirst({
    where: (categories) => eq(categories.name, name),
  });

  if (existingCategory) {
    return { error: "Category name already exists" };
  }

  const [newCategory] = await db
    .insert(categoryTable)
    .values({ name })
    .returning();

  return newCategory;
};

export const update_Category = async (categoryId: string, name: string) => {
  const existingCategory = await db.query.categories.findFirst({
    where: (categories) =>
      and(eq(categories.name, name), ne(categories.id, categoryId)),
  });

  if (existingCategory) {
    throw new Error("Category name already exists");
  }

  const [updatedCategory] = await db
    .update(categoryTable)
    .set({ name })
    .where(eq(categoryTable.id, categoryId))
    .returning();

  if (!updatedCategory) {
    throw new Error("Category not found");
  }

  return updatedCategory;
};

export const delete_Category = async (categoryId: string) => {
  const category = await db.query.categories.findFirst({
    where: (categories) => eq(categories.id, categoryId as string),
  });
  if (!category) {
    return {
      message: "Category not found",
    };
  }

  await db
    .delete(categoryTable)
    .where(eq(categoryTable.id, categoryId as string));

  return {
    message: "Category deleted successfully",
  };
};
