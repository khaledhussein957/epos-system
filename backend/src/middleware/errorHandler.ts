import type { Request, Response, NextFunction } from "express";

import { ENV } from "../config/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log("Error:", err.message);

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  const isProduction = ENV.NODE_ENV === "production";
  const message =
    isProduction && statusCode === 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    message,
    ...(!isProduction && { stack: err.stack }),
  });
};

// if status code is 200 and we still hit the error handler that means it's an internal error
// so we set the status code as 500
