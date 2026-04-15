import zod, { number } from "zod";

export const createProductSchema = zod.object({
  name: zod.string().min(1, "Product name is required"),
  description: zod.string().min(1, "Product description is required"),
  category_id: zod.string().min(1, "Category is required"),
  price: number().positive("Price must be greater than 0"),
  stock: number()
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),
  is_active: zod.boolean(),
  imageUri: zod
    .string()
    .min(1, "Product image URI is required")
    .refine(
      (value) =>
        value.startsWith("file://") ||
        value.startsWith("content://") ||
        value.startsWith("ph://"),
      "Use a local image URI like file://...",
    ),
});

export const updateProductSchema = zod.object({
  name: zod.string().min(1, "Product name is required"),
  description: zod.string().min(1, "Product description is required"),
  category_id: zod.string().min(1, "Category is required"),
  price: number().positive("Price must be greater than 0"),
  stock: number()
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),
  is_active: zod.boolean(),
  imageUri: zod
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value ||
        value.startsWith("file://") ||
        value.startsWith("content://") ||
        value.startsWith("ph://"),
      "Use a local image URI like file://...",
    ),
});

export type CreateProductInput = zod.infer<typeof createProductSchema>;
export type UpdateProductInput = zod.infer<typeof updateProductSchema>;
