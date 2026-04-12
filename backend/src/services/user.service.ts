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
      resetPasswordToken: false,
      resetPasswordTokenExpiry: false,
    },
  });

  return users;
};

export const toggle_block_user = async (
  userId: string,
  targetUserId: string,
) => {
  if (targetUserId === userId) {
    return {
      message: "You cannot block yourself",
    };
  }

  const targetUser = await db.query.users.findFirst({
    where: (users) => eq(users.id, targetUserId as string),
  });
  if (!targetUser) {
    return {
      message: "Target user not found",
    };
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
    return {
      message: "User not found",
    };
  }

  if (password !== confirmPassword) {
    return {
      message: "Passwords do not match",
    };
  }

  const isCurrentPasswordValid = await comparePassword(
    oldPassword,
    user.password,
  );
  if (!isCurrentPasswordValid) {
    return {
      message: "Current password is incorrect",
    };
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
    return {
      message: "User not found",
    };
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
      return {
        message: "Email already in use",
      };
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
    return {
      message: "Target user ID is required",
    };
  }

  // Admins cannot delete themselves via this endpoint
  if (targetUserId === userId) {
    return {
      message: "Admins cannot delete their own account",
    };
  }

  const targetUser = await db.query.users.findFirst({
    where: (users) => eq(users.id, targetUserId as string),
  });
  if (!targetUser) {
    return {
      message: "Target user not found",
    };
  }

  // Prevent deleting another admin account
  if (targetUser.role === "admin") {
    return {
      message: "You cannot delete another admin account",
    };
  }

  // Fetch the admin's own record to verify their password
  const adminUser = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });
  if (!adminUser) {
    return {
      message: "Admin user not found",
    };
  }

  const isPasswordMatch = await comparePassword(password, adminUser.password);
  if (!isPasswordMatch) {
    return {
      message: "Admin password is incorrect",
    };
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
    return {
      message: "User not found",
    };
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return {
      message: "Current password is incorrect",
    };
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
