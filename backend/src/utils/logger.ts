import pino, { type LoggerOptions } from "pino";

import { ENV } from "../config/env";

const isProd = ENV.NODE_ENV === "production";

const options: LoggerOptions = {
  level: ENV.LOG_LEVEL,
  base: { service: "epos-backend", env: ENV.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      "*.password",
      "*.token",
      "*.refreshToken",
      "*.refresh_token",
      "*.jwt",
      "*.secret",
      "*.apiKey",
      "*.api_key",
      "res.headers['set-cookie']",
    ],
    censor: "[REDACTED]",
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
};

if (!isProd) {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:HH:MM:ss.l",
      ignore: "pid,hostname,service,env",
    },
  };
}

export const logger = pino(options);

export type Logger = typeof logger;
