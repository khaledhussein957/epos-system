import { Router } from "express";

import {
  getCustomers,
  getOneCustomer,
  postCustomer,
  putCustomer,
  removeCustomer,
} from "../controllers/customer.controller";
import { protectRoute } from "../middlewares/protectRoute.middleware";

const router = Router();

router.use(protectRoute);

router.get("/", getCustomers);
router.get("/:id", getOneCustomer);
router.post("/", postCustomer);
router.put("/:id", putCustomer);
router.delete("/:id", removeCustomer);

export default router;
