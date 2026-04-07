import express from "express";
import cors from "cors";

import { ENV } from "./config/env";

import { errorHandler } from "./middlewares/errorHandler.ts";

import authRouter from "./routes/auth.route";
import userRoute from "./routes/user.route";
import categoryRoute from "./routes/category.route";

const app = express();

app.use(
  cors({
    origin: ENV.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);

app.use(errorHandler);

export default app;