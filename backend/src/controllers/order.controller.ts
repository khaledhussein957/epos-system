import type { Response } from "express";

import type { AuthRequest } from "../middlewares/protectRoute.middleware";

import { processTransaction } from "../services/order.service";

import { createOrderSchema } from "../validations/order.validate";

import { generateReceipt } from "../utils/generatePDF.util";

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const userId = req.user!.id;

    const order = (await processTransaction(userId, validatedData)) as any;

    if (!order) {
      return res.status(400).json({ message: "Failed to create order" });
    }

    // Prepare data for receipt
    const receiptData = {
      orderId: order.id,
      date: order.created_at,
      customerName: order.customer?.name,
      paymentMethod: order.payment_method,
      items: order.orderItems.map((oi: any) => ({
        name: oi.product.name,
        quantity: oi.quantity,
        price: parseFloat(oi.product.price),
        subtotal: parseFloat(oi.product.price) * oi.quantity,
      })),
      total: parseFloat(order.total),
    };

    const receiptUrl = await generateReceipt(receiptData);

    return res.status(201).json({
      message: "Order created successfully",
      order,
      receiptUrl,
    });
  } catch (error: any) {
    console.error("❌ Error creating order:", error);
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
