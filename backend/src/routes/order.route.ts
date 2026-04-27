import { Router } from "express";

import { createOrder, getMyOrders } from "../controllers/order.controller";

import { protectRoute } from "../middlewares/protectRoute.middleware";

const router = Router();

router.post("/", protectRoute, createOrder);

router.get("/my-orders", protectRoute, getMyOrders);

export default router;
