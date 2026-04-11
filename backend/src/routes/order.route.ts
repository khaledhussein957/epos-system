import { Router } from "express";

import { createOrder } from "../controllers/order.controller";

import { protectRoute } from "../middlewares/protectRoute.middleware";

const router = Router();

router.post("/", protectRoute, createOrder);

export default router;
