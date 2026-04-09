import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller";

import { protectRoute } from "../middlewares/protectRoute.middleware";

const router = Router();

router.post("/", protectRoute, createCategory);

router.get("/", getCategories);

router.put("/:id", protectRoute, updateCategory);

router.delete("/:id", protectRoute, deleteCategory);

export default router;