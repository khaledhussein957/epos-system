import { eq } from "drizzle-orm";

import { db } from "../config/db";

import { users } from "../models/user.model";

import {
  comparePassword,
  generateResetPasswordCode,
  generateToken,
  hashPassword,
  isResetPasswordCodeExpired,
  resetPasswordCodeExpiration,
} from "../utils/auth.util";

import {
  sendResetPasswordEmail,
  sendSuccessResetPasswordEmail,
} from "../emails/emailHandler";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  role: "admin" | "cashier" | "customer" = "customer",
) => {
  if (!name || !email || !password || !phone) {
    throw new Error("All fields are required");
  }

  email = email.toLowerCase().trim();

  const existingUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      profilePicture: name.trim()[0]?.toUpperCase() ?? "U",
      lastLogin: new Date(),
    })
    .returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  const userToken = generateToken(user.id, user.role);
  const now = new Date();

  return {
    message: "Registration successful",
    userToken,
    user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isBlock: user.isBlock,
      lastLogin: now,
      profilePicture: user.profilePicture,
    },
  };
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("All fields are required");
  }

  email = email.toLowerCase().trim();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  if (user.isBlock) {
    throw new Error("Your account has been blocked");
  }

  const now = new Date();

  await db.update(users).set({ lastLogin: now }).where(eq(users.id, user.id));

  const userToken = generateToken(user.id, user.role);

  return {
    message: "Login successful",
    userToken,
    user: {
      _id: user.id, // Map id to _id for compatibility
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isBlock: user.isBlock,
      lastLogin: now,
      profilePicture: user.profilePicture,
    },
  };
};

export const recoveryPassword = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  email = email.toLowerCase().trim();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });
  if (!user) {
    throw new Error("User does not exist");
  }

  const now = new Date();
  const lastSent = user.resetPasswordLastSent;
  let resetCount = Number(user.resetPasswordEmailCount ?? 0);

  // Rate limiting: 1 min between requests
  if (lastSent) {
    const elapsed = now.getTime() - new Date(lastSent).getTime();
    if (elapsed >= 24 * 60 * 60 * 1000) resetCount = 0; // reset daily counter
    if (elapsed < 60 * 1000) {
      return {
        message:
          "Please wait before requesting another password recovery email.",
      };
    }
  }

  if (resetCount >= 3) {
    return {
      message: "Too many recovery attempts today",
    };
  }

  resetCount += 1;

  const resetCode = await generateResetPasswordCode();
  const codeExpiry = resetPasswordCodeExpiration(15); // 15 minutes

  if (process.env.NODE_ENV === "development") {
    console.log("Reset Code:", resetCode, "Code Expires:", codeExpiry);
  }

  await db
    .update(users)
    .set({
      resetPasswordCode: resetCode,
      resetPasswordCodeExpiry: codeExpiry,
      resetPasswordEmailCount: resetCount,
      resetPasswordLastSent: now,
    })
    .where(eq(users.id, user.id));

  await sendResetPasswordEmail(
    user.email,
    resetCode,
    codeExpiry.getTime() - now.getTime(),
  );

  return {
    message:
      "Password recovery email sent. Please check your inbox for further instructions.",
  };
};

export const resetPassword = async (
  code: string,
  newPassword: string,
  confirmPassword: string,
) => {
  if (!code || !newPassword || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.resetPasswordCode, code),
  });

  if (!user) throw new Error("Invalid or expired code");

  if (
    user.resetPasswordCodeExpiry &&
    isResetPasswordCodeExpired(user.resetPasswordCodeExpiry)
  ) {
    throw new Error("Reset code has expired");
  }

  const isSamePassword = await comparePassword(newPassword, user.password);
  if (isSamePassword) {
    throw new Error("New password must be different from old password");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  const hashedPassword = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      password: hashedPassword,
      resetPasswordCode: null,
      resetPasswordCodeExpiry: null,
      resetPasswordEmailCount: 0,
      resetPasswordLastSent: null,
    })
    .where(eq(users.id, user.id));

  await sendSuccessResetPasswordEmail(user.email);

  return {
    message: "Password reset successful",
  };
};
