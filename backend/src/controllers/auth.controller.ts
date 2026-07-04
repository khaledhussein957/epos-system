import type { Request, Response } from "express";
import { logger } from "../utils/logger";

import {
  registerUser,
  loginUser,
  recoveryPassword,
  refreshSession,
  resetPassword,
  revokeRefreshToken,
} from "../services/auth.service";

import { formatZodError } from "../utils/validation.util";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validations/auth.validate";

export const registerAccount = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: formatZodError(parsed.error),
      });
    }

    const { name, email, password, phone } = parsed.data;

    const result = await registerUser(name, email, password, phone);

    res.json(result);
  } catch (error: any) {
    logger.warn({ err: error }, "❌ Error in register account:");
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};

export const loginAccount = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: formatZodError(parsed.error),
      });
    }

    const { email, password } = parsed.data;

    const result = await loginUser(email, password);

    res.json(result);
  } catch (error: any) {
    logger.warn({ err: error }, "❌ Error in login account:");
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

export const recoverPasswordAccount = async (req: Request, res: Response) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: formatZodError(parsed.error),
      });
    }

    const { email } = parsed.data;

    await recoveryPassword(email); // will throw if user does not exist

    res.json({
      message: "Password recovery email sent.",
    });
  } catch (error: any) {
    logger.warn({ err: error }, "Error in recovery password account:");

    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }

    res.status(500).json({
      message: error.message || "Password recovery failed",
    });
  }
};

export const refreshAccount = async (req: Request, res: Response) => {
  try {
    const refreshToken = (req.body?.refreshToken as string | undefined)?.trim();
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    const result = await refreshSession(refreshToken);
    return res.json(result);
  } catch (error: any) {
    logger.warn({ err: error }, "Error in refresh account:");
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: error.message || "Refresh failed" });
  }
};

export const logoutAccount = async (req: Request, res: Response) => {
  try {
    const refreshToken = (req.body?.refreshToken as string | undefined)?.trim();
    await revokeRefreshToken(refreshToken ?? "");
    return res.json({ message: "Logged out" });
  } catch (error: any) {
    logger.warn({ err: error }, "Error in logout account:");
    return res
      .status(500)
      .json({ message: error.message || "Logout failed" });
  }
};

export const resetPasswordAccount = async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: formatZodError(parsed.error),
      });
    }

    const { newPassword, confirmPassword, code, email } = parsed.data;

    await resetPassword(email, code, newPassword, confirmPassword);

    res.json({
      message: "Password reset successful",
    });
  } catch (error: any) {
    logger.warn({ err: error }, "❌ Error in reset password account:");
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    res.status(400).json({
      message: error.message || "Password reset failed",
    });
  }
};
