import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller";

import { protectRoute } from "../middlewares/protectRoute.middleware";
import { uploadCategory } from "../middlewares/upload.middleware";

const router = Router();

router.post(
  "/",
  protectRoute,
  uploadCategory.single("categoryImage"),
  createCategory,
);

router.get("/", getCategories);

router.put(
  "/:id",
  protectRoute,
  uploadCategory.single("categoryImage"),
  updateCategory,
);

router.delete("/:id", protectRoute, deleteCategory);

export default router;