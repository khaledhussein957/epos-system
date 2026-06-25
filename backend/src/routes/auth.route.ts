import { Router } from "express";

import {
  loginAccount,
  logoutAccount,
  recoverPasswordAccount,
  refreshAccount,
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
authRouter.post("/refresh", authLimiter, refreshAccount);
authRouter.post("/logout", logoutAccount);
authRouter.post(
  "/request-password-reset",
  passwordResetLimiter,
  recoverPasswordAccount,
);
authRouter.post("/reset-password", passwordResetLimiter, resetPasswordAccount);

export default authRouter;
