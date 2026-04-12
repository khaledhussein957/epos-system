import zod from "zod";

export const registerSchema = zod.object({
  name: zod.string().min(2, "Name is required"),
  email: zod.string().email("Invalid email address"),
  phone: zod.string().min(1, "Phone number is required"),
  password: zod
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
});

export const loginSchema = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(8, "Password must be at least 8 characters long"),
});

export const forgotPasswordSchema = zod.object({
  email: zod.string().email("Invalid email address"),
});

export const resetPasswordSchema = zod
  .object({
    code: zod.string().min(1, "Reset code is required").max(6, "Invalid code"),
    newPassword: zod
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: zod
      .string()
      .min(8, "Confirm password must be at least 8 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resendCode = zod.object({
  email: zod.string().email("Invalid email address"),

  code: zod
    .string()
    .min(1, "Reset code is required")
    .max(6, "Invalid code"),
});

export type RegisterInput = zod.infer<typeof registerSchema>;
export type LoginInput = zod.infer<typeof loginSchema>;
export type ForgotPasswordInput = zod.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = zod.infer<typeof resetPasswordSchema>;
export type ResendCodeInput = zod.infer<typeof resendCode>;
