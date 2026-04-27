import type { Response } from "express";
import { eq, ne } from "drizzle-orm";

import { db } from "../config/db";

import { users as userTable } from "../models/user.model";

import { type AuthRequest } from "../middlewares/protectRoute.middleware";

import { formatZodError } from "../utils/validation.util";

import {
  changePasswordSchema,
  deleteAccountSchema,
  deleteUserSchema,
  updateProfileSchema,
  updateUserProfileSchema,
} from "../validations/user.validate.ts";

import {
  change_password,
  delete_account,
  delete_user,
  get_all_users,
  toggle_block_user,
  update_profile,
  upload_profile_image,
} from "../services/user.service";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: User is not an admin" });
    }

    const users = await get_all_users(userId);

    return res.status(200).json({ users });
  } catch (error: any) {
    console.error("Get All Users error:", error);
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const toggleBlockUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User not authenticated",
      });
    }

    if (req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized: User is not an admin",
      });
    }

    const { targetUserId } = req.params;

    const result = await toggle_block_user(userId, targetUserId as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Toggle Block User error:", error);
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const bodyValidation = changePasswordSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res
        .status(400)
        .json({ message: formatZodError(bodyValidation.error) });
    }

    const { oldPassword, password, confirmPassword } = bodyValidation.data;

    const result = await change_password(
      userId,
      oldPassword,
      password,
      confirmPassword,
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Change Password error:", error);
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await upload_profile_image(userId, req.file.path);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Upload Profile Image error:", error);
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const bodyValidation = updateProfileSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res
        .status(400)
        .json({ message: formatZodError(bodyValidation.error) });
    }

    const { name, email, phone } = bodyValidation.data;

    const result = await update_profile(userId, email!, name!, phone!);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Profile error:", error);
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: User is not an admin" });
    }

    const { targetUserId } = req.params;
    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    if (targetUserId === userId) {
      return res.status(403).json({
        message: "Admins cannot update their own account via this endpoint",
      });
    }

    const targetUser = await db.query.users.findFirst({
      where: (users) => eq(users.id, targetUserId as string),
    });
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const bodyValidation = updateUserProfileSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res
        .status(400)
        .json({ message: formatZodError(bodyValidation.error) });
    }

    const { name, email, phone } = bodyValidation.data;

    if (email) {
      const existingUser = await db.query.users.findFirst({
        where: (users) =>
          eq(users.email, email) && ne(users.id, targetUserId as string),
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    await db
      .update(userTable)
      .set({ name, email, phone })
      .where(eq(userTable.id, targetUserId as string));

    return res
      .status(200)
      .json({ message: "User profile updated successfully" });
  } catch (error: any) {
    console.error("Update User Profile error:", error);
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    // Only admins can delete other users
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: User is not an admin" });
    }

    const { targetUserId } = req.params;

    // Require the requesting admin's password as confirmation
    const bodyValidation = deleteUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        message: formatZodError(bodyValidation.error),
      });
    }

    const { password } = bodyValidation.data;

    const result = await delete_user(userId, targetUserId as string, password);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete User error:", error);
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const bodyValidation = deleteAccountSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res
        .status(400)
        .json({ message: formatZodError(bodyValidation.error) });
    }

    const { password } = bodyValidation.data;

    const result = await delete_account(userId, password);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete Account error:", error);
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.issues });
    }
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};
