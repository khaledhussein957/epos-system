import { eq, ne } from "drizzle-orm";
import { unlink } from "fs/promises";

import { db } from "../config/db";
import cloudinary from "../config/cloudinary";

import { users as userTable } from "../models/user.model";

import { comparePassword, hashPassword } from "../utils/auth.util";

export const get_all_users = async (userId: string) => {
  const users = await db.query.users.findMany({
    where: (users) => ne(users.id, userId),
    columns: {
      password: false,
      resetPasswordCode: false,
      resetPasswordCodeExpiry: false,
    },
  });

  return users;
};

export const toggle_block_user = async (
  userId: string,
  targetUserId: string,
) => {
  if (targetUserId === userId) {
    const err = new Error("You cannot block yourself") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  const targetUser = await db.query.users.findFirst({
    where: (users) => eq(users.id, targetUserId as string),
  });
  if (!targetUser) {
    const err = new Error("Target user not found") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  const newBlockStatus = !targetUser.isBlock;

  await db
    .update(userTable)
    .set({ isBlock: newBlockStatus })
    .where(eq(userTable.id, targetUserId as string));

  return {
    message: `User ${newBlockStatus ? "blocked" : "unblocked"} successfully`,
    newBlockStatus,
  };
};

export const change_password = async (
  userId: string,
  oldPassword: string,
  password: string,
  confirmPassword: string,
) => {
  const user = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });
  if (!user) {
    const err = new Error("User not found") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  if (password !== confirmPassword) {
    const err = new Error("Passwords do not match") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  const isCurrentPasswordValid = await comparePassword(
    oldPassword,
    user.password,
  );
  if (!isCurrentPasswordValid) {
    const err = new Error("Current password is incorrect") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  const hashedPassword = await hashPassword(password);

  await db
    .update(userTable)
    .set({ password: hashedPassword })
    .where(eq(userTable.id, userId));

  return {
    message: "Password changed successfully",
  };
};

export const upload_profile_image = async (
  userId: string,
  profileImage: any,
) => {
  const user = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });
  if (!user) {
    const err = new Error("User not found") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  // Delete previous avatar from Cloudinary (non-blocking)
  if (user.profilePublicId) {
    try {
      await cloudinary.uploader.destroy(user.profilePublicId);
      console.log("✅ Old avatar destroyed:", user.profilePublicId);
    } catch (error) {
      console.log(`❌ Error destroying old avatar: ${error}`);
    }
  }

  const result = await cloudinary.uploader.upload(profileImage, {
    folder: "profile_images",
    public_id: `${userId}_${Date.now()}`,
    resource_type: "image",
  });

  // clean up local file after upload
  try {
    await unlink(profileImage);
  } catch (error) {
    console.error("Error deleting local file:", error);
  }

  const updatedUser = await db
    .update(userTable)
    .set({
      profilePicture: result.secure_url,
      profilePublicId: result.public_id,
    })
    .where(eq(userTable.id, userId));

  return {
    message: "Profile image uploaded successfully",
    updatedUser,
  };
};

export const update_profile = async (
  userId: string,
  email: string,
  name: string,
  phone: string,
) => {
  if (email) {
    const existingUser = await db.query.users.findFirst({
      where: (users) => eq(users.email, email) && ne(users.id, userId),
    });
    if (existingUser) {
      const err = new Error("Email already in use") as Error & {
        status?: number;
      };
      err.status = 404;
      throw err;
    }
  }

  const updatedUser = await db
    .update(userTable)
    .set({ name, email, phone })
    .where(eq(userTable.id, userId));

  return {
    message: "Profile updated successfully",
    updatedUser,
  };
};

export const delete_user = async (
  userId: string,
  targetUserId: string,
  password: string,
) => {
  if (!targetUserId) {
    const err = new Error("Target user ID is required") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  // Admins cannot delete themselves via this endpoint
  if (targetUserId === userId) {
    const err = new Error("Admins cannot delete their own account") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  const targetUser = await db.query.users.findFirst({
    where: (users) => eq(users.id, targetUserId as string),
  });
  if (!targetUser) {
    const err = new Error("Target user not found") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  // Prevent deleting another admin account
  if (targetUser.role === "admin") {
    const err = new Error(
      "You cannot delete another admin account",
    ) as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  // Fetch the admin's own record to verify their password
  const adminUser = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });
  if (!adminUser) {
    const err = new Error("Admin user not found") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  const isPasswordMatch = await comparePassword(password, adminUser.password);
  if (!isPasswordMatch) {
    const err = new Error("Admin password is incorrect") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
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

  return {
    message: "User deleted successfully",
  };
};

export const delete_account = async (userId: string, password: string) => {
  // Fetch user to verify password and get profilePicture
  const user = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });
  if (!user) {
    const err = new Error("User not found") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    const err = new Error("Current password is incorrect") as Error & {
      status?: number;
    };
    err.status = 404;
    throw err;
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

  return {
    message: "Account deleted successfully",
  };
};
