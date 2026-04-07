import type { Response } from "express";
import { eq, ne } from "drizzle-orm";

import { db } from "../config/db";
import cloudinary from "../config/cloudinary.ts";

import { users as userTable } from "../models/user.model";

import { type AuthRequest } from "../middlewares/protectRoute.middleware";

import { formatZodError } from "../utils/validation.util";
import { comparePassword, hashPassword } from "../utils/auth.util";

import {
  changePasswordSchema,
  deleteAccountSchema,
  deleteUserSchema,
  updateProfileSchema,
  updateUserProfileSchema,
} from "../validations/user.validate.ts";

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

    const users = await db.query.users.findMany({
      where: (users) => ne(users.id, userId),
      columns: {
        password: false,
        resetPasswordToken: false,
        resetPasswordTokenExpiry: false,
      },
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Get All Users error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    if (targetUserId === userId) {
      return res.status(403).json({
        message: "You cannot block yourself",
      });
    }

    const targetUser = await db.query.users.findFirst({
      where: (users) => eq(users.id, targetUserId as string),
    });
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const newBlockStatus = !targetUser.isBlock;

    await db
      .update(userTable)
      .set({ isBlock: newBlockStatus })
      .where(eq(userTable.id, targetUserId as string));

    return res.status(200).json({
      message: `User has been ${newBlockStatus ? "blocked" : "unblocked"} successfully`,
      isBlock: newBlockStatus,
    });
  } catch (error) {
    console.error("Toggle Block User error:", error);
    return res.status(500).json({
      message: "Internal server error",
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

    const { oldPassword, password } = bodyValidation.data;

    // Fetch user only when we actually need the stored password hash
    const user = await db.query.users.findFirst({
      where: (users) => eq(users.id, userId),
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentPasswordValid = await comparePassword(
      oldPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    const hashedPassword = await hashPassword(password);

    await db
      .update(userTable)
      .set({ password: hashedPassword })
      .where(eq(userTable.id, userId));

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    // Fetch user to get the existing profilePicture URL
    const user = await db.query.users.findFirst({
      where: (users) => eq(users.id, userId),
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete previous avatar from Cloudinary (non-blocking)
    if (user.profilePicture) {
      try {
        const publicId = user.profilePicture
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log("✅ Old avatar destroyed:", publicId);
        }
      } catch (error) {
        console.log(`❌ Error destroying old avatar: ${error}`);
      }
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_images",
      public_id: `${userId}_${Date.now()}`,
      overwrite: true,
    });

    await db
      .update(userTable)
      .set({ profilePicture: result.secure_url })
      .where(eq(userTable.id, userId));

    return res.status(200).json({
      message: "Profile image uploaded successfully",
      profilePicture: result.secure_url,
    });
  } catch (error) {
    console.error("Upload Profile Image error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    await db
      .update(userTable)
      .set({ name, email, phone })
      .where(eq(userTable.id, userId));

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    await db
      .update(userTable)
      .set({ name, email, phone })
      .where(eq(userTable.id, targetUserId as string));

    return res
      .status(200)
      .json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Update User Profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    // Admins cannot delete themselves via this endpoint
    if (targetUserId === userId) {
      return res
        .status(403)
        .json({ message: "Admins cannot delete their own account" });
    }

    const targetUser = await db.query.users.findFirst({
      where: (users) => eq(users.id, targetUserId as string),
    });
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Prevent deleting another admin account
    if (targetUser.role === "admin") {
      return res
        .status(403)
        .json({ message: "You cannot delete an admin account" });
    }

    // Require the requesting admin's password as confirmation
    const bodyValidation = deleteUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        message: formatZodError(bodyValidation.error),
      });
    }

    const { password } = bodyValidation.data;

    // Fetch the admin's own record to verify their password
    const adminUser = await db.query.users.findFirst({
      where: (users) => eq(users.id, userId),
    });
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    const isPasswordMatch = await comparePassword(password, adminUser.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Delete target user's avatar from Cloudinary (non-blocking)
    if (targetUser.profilePicture) {
      try {
        const publicId = targetUser.profilePicture
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log("✅ Old avatar destroyed:", publicId);
        }
      } catch (error) {
        console.log(`❌ Error destroying old avatar: ${error}`);
      }
    }

    await db.delete(userTable).where(eq(userTable.id, targetUserId as string));

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    // Fetch user to verify password and get profilePicture
    const user = await db.query.users.findFirst({
      where: (users) => eq(users.id, userId),
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Incorrect password" });
    }

    // Prevent admins from self-deleting via this endpoint
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin accounts cannot be self-deleted" });
    }

    // Delete avatar from Cloudinary (non-blocking)
    if (user.profilePicture) {
      try {
        const publicId = user.profilePicture
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log("✅ Old avatar destroyed:", publicId);
        }
      } catch (error) {
        console.log(`❌ Error destroying old avatar: ${error}`);
      }
    }

    await db.delete(userTable).where(eq(userTable.id, userId));

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete Account error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
