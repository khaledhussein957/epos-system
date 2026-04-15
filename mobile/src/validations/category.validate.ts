import zod from "zod";

export const createCategorySchema = zod.object({
  name: zod.string().min(1, "Category name is required"),
});

export const updateCategorySchema = zod.object({
  name: zod.string().min(1, "Category name is required"),
});

export type CreateCategoryInput = zod.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = zod.infer<typeof updateCategorySchema>;
