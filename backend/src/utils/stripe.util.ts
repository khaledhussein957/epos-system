import Stripe from "stripe";
import { ENV } from "../config/env";

export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (
  amount: number,
  orderId: string,
  currency: string = "USD",
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      // Stripe expects amounts in cents
      amount: Math.round(amount * 100),
      currency,
      metadata: { orderId },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    };
  } catch (error) {
    console.error("❌ Stripe Payment Intent Error:", error);
    throw new Error("Failed to initialize card payment");
  }
};
