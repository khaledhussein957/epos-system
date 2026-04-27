import { Router } from "express";

import { controller_get_DashboardData } from "../controllers/dashboard.controller";

import { protectRoute } from "../middlewares/protectRoute.middleware";

const router = Router();

router.get("/", protectRoute, controller_get_DashboardData);

export default router;
