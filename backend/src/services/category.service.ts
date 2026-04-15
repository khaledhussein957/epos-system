import { and, eq, ne } from "drizzle-orm";

import { db } from "../config/db";

import { categories as categoryTable } from "../models/category.model";

import cloudinary from "../config/cloudinary";

export const get_AllCategories = async () => {
  const categories = await db.query.categories.findMany();
  return categories;
};

export const create_Category = async (name: string, image_url: string) => {
  const existingCategory = await db.query.categories.findFirst({
    where: (categories) => eq(categories.name, name),
  });

  if (existingCategory) {
    return { error: "Category name already exists" };
  }

  const uploadResult = await cloudinary.uploader.upload(image_url, {
    folder: "categories",
    resource_type: "image",
    public_id: `category_${Date.now()}`,
  });

  const [newCategory] = await db
    .insert(categoryTable)
    .values({
      name,
      image_url: uploadResult.secure_url,
      public_image_id: uploadResult.public_id,
    })
    .returning();

  return newCategory;
};

export const update_Category = async (
  categoryId: string,
  name: string,
  image_url: string,
) => {
  const existingCategory = await db.query.categories.findFirst({
    where: (categories) =>
      and(eq(categories.name, name), ne(categories.id, categoryId)),
  });

  if (existingCategory) {
    throw new Error("Category name already exists");
  }

  let image;
  let public_image_id;

  if (image_url) {
    // destroy old image
    await cloudinary.uploader.destroy(existingCategory!.public_image_id);

    // upload new image
    const uploadResult = await cloudinary.uploader.upload(image_url, {
      folder: "categories",
      resource_type: "image",
      public_id: `category_${Date.now()}`,
    });

    image = uploadResult.secure_url;
    public_image_id = uploadResult.public_id;
  }

  const [updatedCategory] = await db
    .update(categoryTable)
    .set({
      name,
      image_url: image,
      public_image_id,
    })
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

  if (category.public_image_id) {
    await cloudinary.uploader.destroy(category.public_image_id);
  }

  await db
    .delete(categoryTable)
    .where(eq(categoryTable.id, categoryId as string));

  return {
    message: "Category deleted successfully",
  };
};
