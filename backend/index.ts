import { createServer } from "http";

import app from "./src/server";

import { ENV } from "./src/config/env";
import { pool } from "./src/config/db";

const PORT = ENV.PORT || 3000;

const httpServer = createServer(app);

pool.query("SELECT 1")
  .then(() => {
    console.log("Connected to the database ✅");
    httpServer.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to the database:", error);
    process.exit(1);
  });