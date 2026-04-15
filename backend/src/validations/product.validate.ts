import zod from "zod";

export const createProductSchema = zod.object({
  name: zod.string().min(1, "Product name is required"),
  description: zod.string().min(1, "Product description is required"),

  category_id: zod.string().uuid("Invalid category ID format"),

  price: zod.string().nonempty("Price is required"),

  stock: zod.string().nonempty("Stock is required"),

  is_active: zod.boolean().default(true),
});

export const updateProductSchema = zod.object({
  name: zod.string().min(1, "Product name is required").optional(),
  description: zod
    .string()
    .min(1, "Product description is required")
    .optional(),

  category_id: zod.string().uuid("Invalid category ID format").optional(),

  price: zod
    .number()
    .positive("Price must be a positive number")
    .transform((val) => val.toString())
    .optional(),

  stock: zod
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer")
    .optional(),

  is_active: zod.boolean().optional(),
});

export const deleteProductSchema = zod.object({
  password: zod.string().min(8, "Password must be at least 8 characters long"),
});
