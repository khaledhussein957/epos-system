import { createServer } from "http";

import app from "./src/server";

import { ENV } from "./src/config/env";
import { pool } from "./src/config/db";
import { logger } from "./src/utils/logger";

const PORT = ENV.PORT || 3000;

const httpServer = createServer(app);

pool.query("SELECT 1")
  .then(() => {
    logger.info("database connected");
    httpServer.listen(PORT, () => {
      logger.info({ port: PORT }, "http server listening");
    });
  })
  .catch((error) => {
    logger.fatal({ err: error }, "database connection failed");
    process.exit(1);
  });
