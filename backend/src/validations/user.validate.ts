import zod from "zod";

export const updateProfileSchema = zod.object({
  name: zod
    .string()
    .min(2, "Name must be at least 2 characters long")
    .optional(),
  email: zod.string().email("Invalid email address").optional(),
  phone: zod
    .string()
    .min(9, "Phone number must be at least 9 digits long")
    .optional(),
});

export const updateUserProfileSchema = zod.object({
  name: zod
    .string()
    .min(2, "Name must be at least 2 characters long")
    .optional(),
  email: zod.string().email("Invalid email address").optional(),
  phone: zod
    .string()
    .min(9, "Phone number must be at least 9 digits long")
    .optional(),
});

export const changePasswordSchema = zod
  .object({
    oldPassword: zod
      .string()
      .min(8, "Password must be at least 8 characters long"),
    password: zod
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
      .min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.password !== data.oldPassword, {
    message: "New password cannot be the same as the old password",
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export const deleteUserSchema = zod.object({
  password: zod.string().min(8, "Password must be at least 8 characters long"),
});

export const deleteAccountSchema = zod.object({
  password: zod.string().min(8, "Password must be at least 8 characters long"),
});
