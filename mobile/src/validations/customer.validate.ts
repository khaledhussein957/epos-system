import zod from "zod";

export const createCustomerSchema = zod.object({
  name: zod.string().min(2, "Name is too short").max(120),
  email: zod.string().email("Invalid email address"),
  phone: zod.string().min(5, "Invalid phone number").max(32),
});

export type CreateCustomerInput = zod.infer<typeof createCustomerSchema>;
