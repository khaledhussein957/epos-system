import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

export default app;