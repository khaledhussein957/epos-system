import type { Response } from "express";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";

import { db } from "../config/db";
import cloudinary from "../config/cloudinary.ts";

import {
  products as productTable,
  categories as categoryTable,
} from "../models/product.model";

import { type AuthRequest } from "../middlewares/protectRoute.middleware";

import { formatZodError } from "../utils/validation.util";
import { generateProductQrCode } from "../utils/product.util.ts";

import { comparePassword } from "../utils/auth.util.ts";
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from "../validations/product.validate.ts";

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

    const { name, description, category_id, price, stock } = parsed.data;

    // 📂 Check category exists
    const category = await db.query.categories.findFirst({
      where: eq(categoryTable.id, category_id),
    });

    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    // 💾 Transaction (safe + consistent)
    const result = await db.transaction(async (tx) => {
      // ➕ Insert product
      const [product] = await tx
        .insert(productTable)
        .values({
          name,
          description,
          category_id,
          price: price.toString(),
          stock,
          is_active: true,
          image_url: "",
          qr_code: "", // ✅ placeholder
        })
        .returning();

      // 🔳 Generate QR
      const qrCode = await generateProductQrCode(product!.id);

      await tx
        .update(productTable)
        .set({ qr_code: qrCode })
        .where(eq(productTable.id, product!.id));

      return product;
    });

    return res.status(201).json({
      message: "Product created successfully",
      product: result,
    });
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
    const products = await db.query.products.findMany();

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const productId = req.params.id;

    const product = await db.query.products.findFirst({
      where: eq(productTable.id, productId as string),
    });

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

    // Check if product exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(productTable.id, productId as string),
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if category exists    if (category_id) {
    if (category_id) {
      const category = await db.query.categories.findFirst({
        where: eq(categoryTable.id, category_id),
      });

      if (!category) {
        return res.status(400).json({ message: "Category not found" });
      }
    }

    const result = await db.transaction(async (tx) => {
      const [updatedProduct] = await tx
        .update(productTable)
        .set({
          name,
          description,
          category_id,
          price: price?.toString() ?? existingProduct.price.toString(),
          stock,
          is_active,
          image_url: existingProduct.image_url,
          qr_code: "",
        })
        .where(eq(productTable.id, productId as string))
        .returning();

      return updatedProduct;
    });

    // 🔳 Generate QR
    const qrCode = await generateProductQrCode(result!.id);

    await db
      .update(productTable)
      .set({ qr_code: qrCode })
      .where(eq(productTable.id, result!.id));

    return res.status(200).json({
      message: "Product updated successfully",
      product: result,
    });
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

    const productId = req.params.id;

    const product = await db.query.products.findFirst({
      where: eq(productTable.id, productId as string),
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // delete previous avatar from Cloudinary (non-blocking)
    if (product.image_url) {
      try {
        const publicId = product.image_url
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        console.error("Error deleting previous avatar:", error);
      }
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    // clean up local file after upload
    try {
      await unlink(req.file.path);
    } catch (error) {
      console.error("Error deleting local file:", error);
    }

    await db
      .update(productTable)
      .set({ image_url: result.secure_url })
      .where(eq(productTable.id, productId as string));

    return res.status(200).json({ message: "Image uploaded successfully" });
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

    const product = await db.query.products.findFirst({
      where: eq(productTable.id, productId),
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🖼️ Delete image from Cloudinary
    if (product.image_url) {
      try {
        const publicId = product.image_url.split("/").pop()?.split(".")[0];

        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    await db.delete(productTable).where(eq(productTable.id, productId));

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
