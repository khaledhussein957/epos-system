import { and, eq, isNull, gt } from "drizzle-orm";

import { db } from "../config/db";

import { users } from "../models/user.model";
import { refreshTokens } from "../models/refreshToken.model";

import {
  comparePassword,
  generateRefreshToken,
  generateResetPasswordCode,
  generateToken,
  hashPassword,
  hashRefreshToken,
  isResetPasswordCodeExpired,
  refreshTokenExpiry,
  resetPasswordCodeExpiration,
} from "../utils/auth.util";
import { AppError } from "../utils/AppError";

import {
  sendResetPasswordEmail,
  sendSuccessResetPasswordEmail,
} from "../emails/emailHandler";

const issueSession = async (userId: string, role: string) => {
  const accessToken = generateToken(userId, role);
  const refreshToken = generateRefreshToken();

  await db.insert(refreshTokens).values({
    user_id: userId,
    token_hash: hashRefreshToken(refreshToken),
    expires_at: refreshTokenExpiry(),
  });

  return { accessToken, refreshToken };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  role: "admin" | "cashier" | "customer" = "customer",
) => {
  if (!name || !email || !password || !phone) {
    throw new AppError("All fields are required", 400);
  }

  email = email.toLowerCase().trim();

  const existingUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });

  if (existingUser) {
    throw new AppError("User already exists with this email", 409);
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
    throw new AppError("Failed to create user", 500);
  }

  const { accessToken, refreshToken } = await issueSession(user.id, user.role);
  const now = new Date();

  return {
    message: "Registration successful",
    token: accessToken,
    refreshToken,
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
    throw new AppError("All fields are required", 400);
  }

  email = email.toLowerCase().trim();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.isBlock) {
    throw new AppError("Your account has been blocked", 403);
  }

  const now = new Date();

  await db.update(users).set({ lastLogin: now }).where(eq(users.id, user.id));

  const { accessToken, refreshToken } = await issueSession(user.id, user.role);

  return {
    message: "Login successful",
    token: accessToken,
    refreshToken,
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
    throw new AppError("Email is required", 400);
  }

  email = email.toLowerCase().trim();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });
  if (!user) {
    throw new AppError("User does not exist", 404);
  }

  const now = new Date();
  const lastSent = user.resetPasswordLastSent;
  let resetCount = Number(user.resetPasswordEmailCount ?? 0);

  // Rate limiting: 1 min between requests
  if (lastSent) {
    const elapsed = now.getTime() - new Date(lastSent).getTime();
    if (elapsed >= 24 * 60 * 60 * 1000) resetCount = 0; // reset daily counter
    if (elapsed < 60 * 1000) {
      throw new AppError(
        "Please wait before requesting another password recovery email.",
        429,
      );
    }
  }

  if (resetCount >= 3) {
    throw new AppError("Too many recovery attempts today", 429);
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
  email: string,
  code: string,
  newPassword: string,
  confirmPassword: string,
) => {
  if (!email || !code || !newPassword || !confirmPassword) {
    throw new AppError("All fields are required", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });
  if (!user) {
    throw new AppError("User does not exist", 404);
  }

  if (user.resetPasswordCode !== code) {
    throw new AppError("Invalid reset code", 400);
  }

  if (
    user.resetPasswordCodeExpiry &&
    isResetPasswordCodeExpired(user.resetPasswordCodeExpiry)
  ) {
    throw new AppError("Reset code has expired", 410);
  }

  const isSamePassword = await comparePassword(newPassword, user.password);
  if (isSamePassword) {
    throw new AppError(
      "New password must be different from old password",
      400,
    );
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

export const refreshSession = async (presentedToken: string) => {
  if (!presentedToken) {
    const err = new Error("Refresh token is required") as Error & {
      status?: number;
    };
    err.status = 400;
    throw err;
  }

  const tokenHash = hashRefreshToken(presentedToken);
  const now = new Date();

  const stored = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.token_hash, tokenHash),
      isNull(refreshTokens.revoked_at),
      gt(refreshTokens.expires_at, now),
    ),
  });

  if (!stored) {
    const err = new Error("Invalid or expired refresh token") as Error & {
      status?: number;
    };
    err.status = 401;
    throw err;
  }

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, stored.user_id),
  });

  if (!user || user.isBlock) {
    await db
      .update(refreshTokens)
      .set({ revoked_at: now })
      .where(eq(refreshTokens.id, stored.id));

    const err = new Error("Account no longer active") as Error & {
      status?: number;
    };
    err.status = 401;
    throw err;
  }

  // Rotate: revoke the presented token, issue a new pair.
  await db
    .update(refreshTokens)
    .set({ revoked_at: now })
    .where(eq(refreshTokens.id, stored.id));

  const { accessToken, refreshToken } = await issueSession(user.id, user.role);

  return { token: accessToken, refreshToken };
};

export const revokeRefreshToken = async (presentedToken: string) => {
  if (!presentedToken) return;

  const tokenHash = hashRefreshToken(presentedToken);

  await db
    .update(refreshTokens)
    .set({ revoked_at: new Date() })
    .where(
      and(
        eq(refreshTokens.token_hash, tokenHash),
        isNull(refreshTokens.revoked_at),
      ),
    );
};
