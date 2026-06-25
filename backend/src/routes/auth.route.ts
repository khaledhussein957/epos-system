import { Router } from "express";

import {
  loginAccount,
  logoutAccount,
  recoverPasswordAccount,
  refreshAccount,
  registerAccount,
  resetPasswordAccount,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", registerAccount);
authRouter.post("/login", loginAccount);
authRouter.post("/refresh", refreshAccount);
authRouter.post("/logout", logoutAccount);
authRouter.post("/request-password-reset", recoverPasswordAccount);
authRouter.post("/reset-password", resetPasswordAccount);

export default authRouter;
