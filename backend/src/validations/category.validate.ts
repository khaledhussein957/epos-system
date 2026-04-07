import zod from "zod";

export const createCategorySchema = zod.object({
  name: zod.string().min(1, "Category name is required"),
});

export const updateCategorySchema = zod.object({
  name: zod.string().min(1, "Category name is required").optional(),
});

export const deleteCategorySchema = zod.object({
  password: zod.string().min(8, "Password must be at least 8 characters long"),
});
