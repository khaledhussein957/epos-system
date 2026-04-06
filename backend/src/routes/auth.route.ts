import { Router } from "express";

import {
  loginAccount,
  recoverPasswordAccount,
  registerAccount,
  resetPasswordAccount,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", registerAccount);
authRouter.post("/login", loginAccount);
authRouter.post("/request-password-reset", recoverPasswordAccount);
authRouter.post("/reset-password", resetPasswordAccount);

export default authRouter;
