import { Router } from "express";

import {
  createOrder,
  getMyOrders,
  getAllOrders,
} from "../controllers/order.controller";

import { protectRoute } from "../middlewares/protectRoute.middleware";

const router = Router();

router.post("/", protectRoute, createOrder);

router.get("/my-orders", protectRoute, getMyOrders);
router.get("/", protectRoute, getAllOrders);

export default router;
