import type { Response } from "express";

import type { AuthRequest } from "../middlewares/protectRoute.middleware";

import {
  processTransaction,
  getOrdersByUserId,
} from "../services/order.service";

import { createOrderSchema } from "../validations/order.validate";

import { generateReceipt } from "../utils/generatePDF.util";
import { initiateWaafiPurchase } from "../utils/waafipay.util";
import { createPaymentIntent } from "../utils/stripe.util";

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

    let paymentData = {};

    if (
      validatedData.payment_method === "mobile" ||
      validatedData.payment_method === "bank"
    ) {
      const waafiResponse = await initiateWaafiPurchase({
        accountNo: validatedData.payment_account as string,
        amount: parseFloat(order.total),
        orderId: order.id,
        paymentMethod:
          validatedData.payment_method === "mobile"
            ? "MWALLET_ACCOUNT"
            : "MWALLET_BANKACCOUNT",
      });

      if (!waafiResponse.success) {
        return res.status(400).json({
          message: "WaafiPay payment failed",
          details: waafiResponse.responseMsg,
        });
      }

      paymentData = { transactionId: waafiResponse.transactionId };
    } else if (validatedData.payment_method === "card") {
      const stripeResponse = await createPaymentIntent(
        parseFloat(order.total),
        order.id,
        "USD",
      );
      paymentData = { clientSecret: stripeResponse.clientSecret };
    }

    return res.status(201).json({
      message: "Order created successfully",
      order,
      receiptUrl,
      payment: paymentData,
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

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const userOrders = await getOrdersByUserId(userId);

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders: userOrders,
    });
  } catch (error: any) {
    console.error("Error fetching my orders:", error);
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
