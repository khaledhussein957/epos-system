import type { Response } from "express";
import { z } from "zod";
import { logger } from "../utils/logger";

import type { AuthRequest } from "../middlewares/protectRoute.middleware";
import { AppError } from "../utils/AppError";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "../services/customer.service";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validations/customer.validate";

const requireStaff = (req: AuthRequest) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  if (req.user.role !== "admin" && req.user.role !== "cashier") {
    throw new AppError("Staff only", 403);
  }
};

const requireAdmin = (req: AuthRequest) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  if (req.user.role !== "admin") throw new AppError("Admins only", 403);
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

const requireId = (id: unknown): string => {
  if (typeof id !== "string" || !id) {
    throw new AppError("customer id is required", 400);
  }
  return id;
};

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    requireStaff(req);
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const data = await listCustomers(search);
    return res.json({ data });
  } catch (error) {
    return handleError(res, error, "Failed to list customers");
  }
};

export const getOneCustomer = async (req: AuthRequest, res: Response) => {
  try {
    requireStaff(req);
    const id = requireId(req.params.id);
    const data = await getCustomer(id);
    return res.json({ data });
  } catch (error) {
    return handleError(res, error, "Failed to get customer");
  }
};

export const postCustomer = async (req: AuthRequest, res: Response) => {
  try {
    requireStaff(req);
    const parsed = createCustomerSchema.parse(req.body);
    const data = await createCustomer(parsed);
    return res.status(201).json({ data });
  } catch (error) {
    return handleError(res, error, "Failed to create customer");
  }
};

export const putCustomer = async (req: AuthRequest, res: Response) => {
  try {
    requireStaff(req);
    const id = requireId(req.params.id);
    const parsed = updateCustomerSchema.parse(req.body);
    const data = await updateCustomer(id, parsed);
    return res.json({ data });
  } catch (error) {
    return handleError(res, error, "Failed to update customer");
  }
};

export const removeCustomer = async (req: AuthRequest, res: Response) => {
  try {
    requireAdmin(req);
    const id = requireId(req.params.id);
    await deleteCustomer(id);
    return res.json({ message: "Customer deleted" });
  } catch (error) {
    return handleError(res, error, "Failed to delete customer");
  }
};
