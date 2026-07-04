import type { Response } from "express";
import { logger } from "../utils/logger";

import type { AuthRequest } from "../middlewares/protectRoute.middleware";

import {
  processTransaction,
  getOrders,
  getOrdersByUserId,
} from "../services/order.service";

import { createOrderSchema } from "../validations/order.validate";

import { generateReceipt } from "../utils/generatePDF.util";

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const orders = await getOrders(req.user.id);

    return res.status(200).json({ orders });
  } catch (error: any) {
    logger.error({ err: error }, "❌ Error fetching orders:");
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    }
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const validatedData = createOrderSchema.parse(req.body);

    const order = await processTransaction(req.user.id, validatedData);

    if (!order) {
      return res.status(400).json({ message: "Failed to create order" });
    }

    // Prepare data for receipt
    const receiptData = {
      orderId: order.id,
      date: order.created_at,
      customerName: order.customer?.name,
      paymentMethod: order.payment_method,
      items: order.orderItems.map((oi) => ({
        name: oi.product.name,
        quantity: oi.quantity,
        price: parseFloat(oi.price),
        subtotal: parseFloat(oi.price) * oi.quantity,
      })),
      subtotal: parseFloat(order.subtotal),
      discount: parseFloat(order.discount),
      tax: parseFloat(order.tax),
      total: parseFloat(order.total),
    };

    const receiptUrl = await generateReceipt(receiptData);

    return res.status(201).json({
      message: "Order created successfully",
      order,
      receiptUrl,
    });
  } catch (error: any) {
    logger.error({ err: error }, "❌ Error creating order:");
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    }
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userOrders = await getOrdersByUserId(req.user.id);

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders: userOrders,
    });
  } catch (error: any) {
    logger.error({ err: error }, "Error fetching my orders:");
    if (typeof error?.status === "number") {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    }
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
