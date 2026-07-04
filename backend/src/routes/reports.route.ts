import { Router } from "express";

import {
  getCustomerHistory,
  getDailySales,
  getLowStock,
  getRevenueByCashier,
  getTopProducts,
} from "../controllers/reports.controller";
import { protectRoute } from "../middlewares/protectRoute.middleware";

const router = Router();

router.use(protectRoute);

router.get("/daily-sales", getDailySales);
router.get("/top-products", getTopProducts);
router.get("/low-stock", getLowStock);
router.get("/revenue-by-cashier", getRevenueByCashier);
router.get("/customer-history/:id", getCustomerHistory);

export default router;
