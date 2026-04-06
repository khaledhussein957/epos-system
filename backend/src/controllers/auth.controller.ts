import type { Request, Response } from "express";

import {
  registerUser,
  loginUser,
  recoveryPassword,
  resetPassword,
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

    const { name, email, password, phone, role } = parsed.data;

    const result = await registerUser(name, email, password, phone, role);

    res.json(result);
  } catch (error: any) {
    console.log("❌ Error in register account:", error);
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
    console.log("❌ Error in login account:", error);
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

    await recoveryPassword(email);

    res.json({
      message: "Password recovery email sent if the email is registered.",
    });
  } catch (error: unknown) {
    // Log the error server-side but return generic message to prevent enumeration
    console.error("Error in recovery password account:", error);
    res.json({
      message: "Password recovery email sent if the email is registered.",
    });
  }};

export const resetPasswordAccount = async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: formatZodError(parsed.error),
      });
    }

    const { newPassword, confirmPassword } = parsed.data;

    const token = Array.isArray(req.params.token)
      ? req.params.token[0]
      : req.params.token;

    if (!token) {
      return res.status(400).json({
        message: "Password reset token is required",
      });
    }

    await resetPassword(token as string, newPassword, confirmPassword);

    res.json({
      message: "Password reset successful",
    });
  } catch (error: any) {
    console.log("❌ Error in reset password account:", error);

    res.status(400).json({
      message: error.message || "Password reset failed",
    });
  }
};
