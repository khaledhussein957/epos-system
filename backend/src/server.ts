import express from "express";
import cors from "cors";

import { ENV } from "./config/env";

import { errorHandler } from "./middleware/errorHandler.ts";

import authRouter from "./routes/auth.route";

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

app.use(errorHandler);

export default app;