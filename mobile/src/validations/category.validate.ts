import zod from "zod";

export const createCategorySchema = zod.object({
  name: zod.string().min(1, "Category name is required"),
  image_url: zod
    .string()
    .url("Invalid image URL")
    .optional()
    .or(zod.literal("")),
});

export const updateCategorySchema = zod.object({
  name: zod.string().min(1, "Category name is required"),
});

export type CreateCategoryInput = zod.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = zod.infer<typeof updateCategorySchema>;
