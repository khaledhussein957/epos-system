import { Router } from "express";

import {
    createProduct,
    deleteProduct,
    getProducts,
    getProductById,
    uploadProductImage,
    updateProduct,
} from "../controllers/product.controller";

import { protectRoute } from "../middlewares/protectRoute.middleware";
import { uploadProduct } from "../middlewares/upload.middleware";

const router = Router();

router.post("/", protectRoute, createProduct);

router.get("/", getProducts);
router.get("/:id", getProductById);

router.put("/:id", protectRoute, updateProduct);
router.put("/product-image/:id", protectRoute, uploadProduct.single("productImage"), uploadProductImage);

router.delete("/:id", protectRoute, deleteProduct);

export default router;