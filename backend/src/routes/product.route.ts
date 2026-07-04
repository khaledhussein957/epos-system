import { Router } from "express";

import {
    adjustProductStock,
    createProduct,
    deleteProduct,
    getProducts,
    getProductByBarcode,
    getProductById,
    getStockAdjustments,
    uploadProductImage,
    updateProduct,
} from "../controllers/product.controller";

import { protectRoute } from "../middlewares/protectRoute.middleware";
import { uploadProduct } from "../middlewares/upload.middleware";

const router = Router();

router.post(
  "/",
  protectRoute,
  uploadProduct.single("productImage"),
  createProduct,
);

router.get("/", getProducts);
router.get("/by-barcode/:code", protectRoute, getProductByBarcode);
router.get("/:id", getProductById);

router.put("/:id", protectRoute, updateProduct);
router.put(
  "/product-image/:id",
  protectRoute,
  uploadProduct.single("productImage"),
  uploadProductImage,
);
router.post("/:id/adjust-stock", protectRoute, adjustProductStock);
router.get("/:id/stock-history", protectRoute, getStockAdjustments);

router.delete("/:id", protectRoute, deleteProduct);

export default router;
