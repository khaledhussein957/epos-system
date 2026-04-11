import { z } from "zod";

export const createOrderSchema = z.object({
  customer_id: z.string().uuid().optional(),
  customer_info: z
    .object({
      name: z.string().min(2, "Name is too short"),
      phone: z.string().min(5, "Invalid phone number"),
      email: z.string().email("Invalid email address"),
    })
    .optional(),
  payment_method: z.enum(["cash", "card", "mobile"]),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "At least one item is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
