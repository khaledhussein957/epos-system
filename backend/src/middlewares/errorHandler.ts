import type { Request, Response, NextFunction } from "express";

import { ENV } from "../config/env";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  const isProduction = ENV.NODE_ENV === "production";

  // Use req.log (pino-http per-request child) if available so the entry
  // carries the request id; fall back to the root logger.
  const log = (req as Request & { log?: typeof logger }).log ?? logger;

  if (statusCode >= 500) {
    log.error({ err, statusCode }, "unhandled error");
  } else {
    log.warn({ err: { message: err.message }, statusCode }, "request failed");
  }

  const message =
    isProduction && statusCode === 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    message,
    ...(!isProduction && { stack: err.stack }),
  });
};
