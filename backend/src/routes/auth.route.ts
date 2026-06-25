import { Router } from "express";

import {
  loginAccount,
  recoverPasswordAccount,
  registerAccount,
  resetPasswordAccount,
} from "../controllers/auth.controller";
import {
  authLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimit.middleware";

const authRouter = Router();

authRouter.post("/register", authLimiter, registerAccount);
authRouter.post("/login", authLimiter, loginAccount);
authRouter.post(
  "/request-password-reset",
  passwordResetLimiter,
  recoverPasswordAccount,
);
authRouter.post("/reset-password", passwordResetLimiter, resetPasswordAccount);

export default authRouter;
