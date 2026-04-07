import type { Request, Response, NextFunction } from "express";

import { db } from "../config/db";
import { verifyToken } from "../utils/auth.util";

// Extend Express Request to include user info
export type AuthRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

interface JwtPayloadCustom {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const protectRoute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    const decoded = verifyToken(token) as JwtPayloadCustom;

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, decoded.id),
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    if (user.isBlock === true) {
      return res.status(403).json({ message: "Forbidden: User is blocked" });
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error(`❌ Error in protectRoute: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};