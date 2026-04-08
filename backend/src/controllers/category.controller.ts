import type { Response } from "express";
import { eq } from "drizzle-orm";

import { db } from "../config/db";
import { categories as categoryTable } from "../models/category.model";

import { type AuthRequest } from "../middlewares/protectRoute.middleware";

import { formatZodError } from "../utils/validation.util";
import { comparePassword } from "../utils/auth.util.ts";

import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from "../validations/category.validate";

import {
  delete_Category,
  create_Category,
  get_AllCategories,
  update_Category,
} from "../services/category.service.ts";

export const createCategory = async (req: AuthRequest, res: Response) => {
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

    const bodyValidation = createCategorySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const formattedErrors = formatZodError(bodyValidation.error);
      return res
        .status(400)
        .json({ message: "Validation error", errors: formattedErrors });
    }

    const { name } = bodyValidation.data;

    const newCategory = await create_Category(name as string);
    
    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await get_AllCategories();
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
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

    const categoryId = req.params.id;

    const bodyValidation = updateCategorySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const formattedErrors = formatZodError(bodyValidation.error);
      return res
        .status(400)
        .json({ message: "Validation error", errors: formattedErrors });
    }

    const { name } = bodyValidation.data;

    const updatedCategory = await update_Category(
      categoryId as string,
      name as string,
    );

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
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

    const categoryId = req.params.id;

    const bodyValidation = deleteCategorySchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const formattedErrors = formatZodError(bodyValidation.error);
      return res
        .status(400)
        .json({ message: "Validation error", errors: formattedErrors });
    }

    const { password } = bodyValidation.data;

    const user = await db.query.users.findFirst({
      where: (users) => eq(users.id, userId),
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await delete_Category(categoryId as string);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
