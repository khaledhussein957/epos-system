import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";

import { db } from "../config/db";
import cloudinary from "../config/cloudinary";

import { products as productTable } from "../models/product.model";
import { categories as categoryTable } from "../models/category.model";

import { generateProductQrCode } from "../utils/product.util";
import { AppError } from "../utils/AppError";

const safeUnlink = async (filePath: string) => {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error("Error deleting local file:", error);
  }
};

export const create_product = async (
  name: string,
  description: string,
  category_id: string,
  price: number,
  stock: number,
  isActive: boolean,
  productImage: string,
) => {
  // 📂 Check category exists
  const category = await db.query.categories.findFirst({
    where: eq(categoryTable.id, category_id),
  });

  if (!category) {
    await safeUnlink(productImage);
    throw new AppError("Category not found", 404);
  }

  let UploadResult;
  try {
    UploadResult = await cloudinary.uploader.upload(productImage, {
      folder: "product_images",
      resource_type: "image",
    });
  } finally {
    // clean up local file regardless of upload outcome
    await safeUnlink(productImage);
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
        price: price.toFixed(2),
        stock,
        is_active: isActive,
        image_url: UploadResult.secure_url,
        image_public_id: UploadResult.public_id,
        qr_code: "",
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

  return result;
};

export const get_all_products = async () => {
  const products = await db.query.products.findMany({
    with: { category: true },
  });
  return products;
};

export const get_product_by_id = async (productId: string) => {
  const product = await db.query.products.findFirst({
    where: eq(productTable.id, productId),
    with: { category: true },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const update_product = async (
  name: string,
  description: string,
  category_id: string,
  price: number,
  stock: number,
  is_active: boolean,
  productId: string,
) => {
  // Check if product exists
  const existingProduct = await db.query.products.findFirst({
    where: eq(productTable.id, productId as string),
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  // Check if category exists
  if (category_id) {
    const category = await db.query.categories.findFirst({
      where: eq(categoryTable.id, category_id),
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  const result = await db.transaction(async (tx) => {
    const [updatedProduct] = await tx
      .update(productTable)
      .set({
        name,
        description,
        category_id,
        price: price != null ? price.toFixed(2) : existingProduct.price,
        stock: stock != null ? stock : existingProduct.stock,
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

  return result;
};

export const upload_product_image = async (
  productId: string,
  filePath: string,
) => {
  const product = await db.query.products.findFirst({
    where: eq(productTable.id, productId),
  });

  if (!product) {
    await safeUnlink(filePath);
    throw new AppError("Product not found", 404);
  }

  // delete previous image
  if (product.image_public_id) {
    try {
      await cloudinary.uploader.destroy(product.image_public_id);
    } catch (error) {
      console.error("Error deleting previous image:", error);
    }
  }

  let result;
  try {
    result = await cloudinary.uploader.upload(filePath, {
      folder: "products",
      public_id: `${product.id}_${Date.now()}`,
    });
  } finally {
    await safeUnlink(filePath);
  }

  const [updatedProduct] = await db
    .update(productTable)
    .set({
      image_url: result.secure_url,
      image_public_id: result.public_id,
    })
    .where(eq(productTable.id, productId))
    .returning();

  return updatedProduct;
};

export const delete_product = async (productId: string) => {
  const product = await db.query.products.findFirst({
    where: eq(productTable.id, productId),
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // 🖼️ Delete image from Cloudinary
  if (product.image_url) {
    try {
      await cloudinary.uploader.destroy(product.image_public_id!);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }
  }

  await db.delete(productTable).where(eq(productTable.id, productId));

  return { message: "Product deleted successfully" };
};
