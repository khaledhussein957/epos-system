import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { ENV } from "../config/env";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const generateToken = (id: string, role: string) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id, role }, ENV.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
};
export const verifyToken = (token: string) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, ENV.JWT_SECRET as string);
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(48).toString("base64url");
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const refreshTokenExpiry = (): Date => {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
};

export const generateResetPasswordCode = async (): Promise<string> => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const resetPasswordCodeExpiration = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000); // current time + minutes in milliseconds
};

export const isResetPasswordCodeExpired = (expirationDate: Date): boolean => {
  return new Date() > expirationDate;
};
