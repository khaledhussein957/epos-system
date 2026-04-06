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

export const generateToken = (id: string, role: string) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id, role }, ENV.JWT_SECRET, {
    expiresIn: "1d",
  });
};
export const verifyToken = (token: string) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, ENV.JWT_SECRET as string);
};

export const generateResetPasswordCode = async (): Promise<string> => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
};

export const resetPasswordCodeExpiration = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000); // current time + minutes in milliseconds
};

export const isResetPasswordCodeExpired = (expirationDate: Date): boolean => {
  return new Date() > expirationDate;
};
