import type { Response } from "express";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";

import { db } from "../config/db";
import cloudinary from "../config/cloudinary.ts";

import { type AuthRequest } from "../middlewares/protectRoute.middleware";

import { formatZodError } from "../utils/validation.util";

import { comparePassword } from "../utils/auth.util.ts";
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from "../validations/product.validate.ts";
import {
  create_product,
  delete_product,
  get_all_products,
  get_product_by_id,
  update_product,
  upload_product_image,
} from "../services/product.service.ts";

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // 🔒 Auth check
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔒 Role check (trust middleware payload)
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    // 🧾 Validate body
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: formatZodError(parsed.error),
      });
    }

    const { name, description, category_id, price, stock, is_active } =
      parsed.data;

    const image = req.file?.path;
    if (!image) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const category = await create_product(
      name,
      description,
      category_id,
      price as any,
      stock,
      is_active,
      image,
    );

    return res.status(201).json({ category });
  } catch (error: any) {
    console.error("Error creating product:", error);

    // ⚠️ Handle unique constraint (optional but recommended)
    if (error.code === "23505") {
      return res.status(400).json({
        message: "Product with this name already exists",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const products = await get_all_products();

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const productId = req.params.id;

    const product = await get_product_by_id(productId as string);

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const productId = req.params.id;

    const bodyValidation = updateProductSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const formattedErrors = formatZodError(bodyValidation.error);
      return res
        .status(400)
        .json({ message: "Validation error", errors: formattedErrors });
    }

    const { name, description, category_id, price, stock, is_active } =
      bodyValidation.data;

    const product = await update_product(
      name!,
      description!,
      category_id!,
      price as any,
      stock!,
      is_active!,
      productId as string,
    );

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadProductImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const productId = req.params.id;

    const updatedProduct = await upload_product_image(
      productId as string,
      req.file.path,
    );

    return res.status(200).json({
      message: "Product image uploaded",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error uploading product image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: productId } = req.params;

    // ✅ Fix: validate param
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const bodyValidation = deleteProductSchema.safeParse(req.body);
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

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: User is not an admin" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await delete_product(productId);

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
