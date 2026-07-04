import type { Response } from "express";
import { z } from "zod";
import { logger } from "../utils/logger";

import type { AuthRequest } from "../middlewares/protectRoute.middleware";
import { AppError } from "../utils/AppError";
import {
  customerHistory,
  dailySales,
  lowStock,
  revenueByCashier,
  topProducts,
} from "../services/reports.service";

const requireAdmin = (req: AuthRequest) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  if (req.user.role !== "admin") throw new AppError("Admins only", 403);
};

const dateRangeSchema = z.object({
  from: z.iso.datetime().optional().or(z.string().optional()),
  to: z.iso.datetime().optional().or(z.string().optional()),
});

const parseRange = (query: unknown) => {
  const parsed = dateRangeSchema.parse(query);
  return {
    from: parsed.from ? new Date(parsed.from) : undefined,
    to: parsed.to ? new Date(parsed.to) : undefined,
  };
};

const handleError = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error instanceof z.ZodError) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: error.issues });
  }
  logger.error({ err: error }, fallback);
  return res.status(500).json({ message: fallback });
};

export const getDailySales = async (req: AuthRequest, res: Response) => {
  try {
    requireAdmin(req);
    const range = parseRange(req.query);
    const rows = await dailySales(range);
    return res.json({ data: rows });
  } catch (error) {
    return handleError(res, error, "Failed to load daily sales");
  }
};

export const getTopProducts = async (req: AuthRequest, res: Response) => {
  try {
    requireAdmin(req);
    const range = parseRange(req.query);
    const limit = Math.min(
      Math.max(Number(req.query.limit ?? 10), 1),
      100,
    );
    const rows = await topProducts(range, limit);
    return res.json({ data: rows });
  } catch (error) {
    return handleError(res, error, "Failed to load top products");
  }
};

export const getLowStock = async (req: AuthRequest, res: Response) => {
  try {
    requireAdmin(req);
    const threshold = Math.max(Number(req.query.threshold ?? 5), 0);
    const rows = await lowStock(threshold);
    return res.json({ data: rows, threshold });
  } catch (error) {
    return handleError(res, error, "Failed to load low-stock products");
  }
};

export const getRevenueByCashier = async (req: AuthRequest, res: Response) => {
  try {
    requireAdmin(req);
    const range = parseRange(req.query);
    const rows = await revenueByCashier(range);
    return res.json({ data: rows });
  } catch (error) {
    return handleError(res, error, "Failed to load revenue by cashier");
  }
};

export const getCustomerHistory = async (req: AuthRequest, res: Response) => {
  try {
    requireAdmin(req);
    const customerId = req.params.id;
    if (typeof customerId !== "string" || !customerId) {
      return res.status(400).json({ message: "customer id is required" });
    }
    const result = await customerHistory(customerId);
    return res.json(result);
  } catch (error) {
    return handleError(res, error, "Failed to load customer history");
  }
};
