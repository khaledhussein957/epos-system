import { z } from "zod";

export const createOrderSchema = z
  .object({
    customer_id: z.string().uuid().optional(),
    customer_info: z
      .object({
        name: z.string().min(2, "Name is too short"),
        phone: z.string().min(5, "Invalid phone number"),
        email: z.string().email("Invalid email address"),
      })
      .optional(),
    payment_method: z.enum(["cash", "card", "mobile", "bank"]),
    payment_account: z
      .string()
      .optional()
      .describe("Required for mobile or bank payments"),
    items: z
      .array(
        z.object({
          product_id: z.string().uuid(),
          quantity: z.string().refine((val) => /^[1-9]\d*$/.test(val), {
            message: "Quantity must be a positive integer",
          }),
        }),
      )
      .min(1, "At least one item is required"),
  })
  .refine(
    (data) => {
      // If payment method is mobile or bank, payment_account is required
      if (["mobile", "bank"].includes(data.payment_method)) {
        return !!data.payment_account && data.payment_account.trim() !== "";
      }
      return true;
    },
    {
      message: "payment_account is required for mobile and bank payments",
      path: ["payment_account"], // path of error
    },
  );

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
