import crypto from "crypto";
import axios from "axios";
import { ENV } from "../config/env";

export type WaafiPaymentMethod = "MWALLET_ACCOUNT" | "MWALLET_BANKACCOUNT";

export interface WaafiPurchaseParams {
  accountNo: string;
  amount: number;
  orderId: string;
  paymentMethod: WaafiPaymentMethod;
  description?: string;
}
export const initiateWaafiPurchase = async (params: WaafiPurchaseParams) => {
  const { accountNo, amount, orderId, paymentMethod, description } = params;

  const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");

  const formattedAmount = (Math.floor(amount * 100) / 100).toString();

  const payload = {
    schemaVersion: "1.0",
    requestId: crypto.randomUUID(),
    timestamp,
    channelName: "WEB",
    serviceName: "API_PURCHASE",
    serviceParams: {
      merchantUid: ENV.MERCHANT_UID,
      apiUserId: ENV.API_USER_ID,
      apiKey: ENV.API_KEY,
      paymentMethod,
      payerInfo: {
        accountNo,
      },
      transactionInfo: {
        referenceId: orderId,
        invoiceId: orderId,
        amount: formattedAmount,
        currency: "USD",
        description: description || `Payment for order ${orderId}`,
      },
    },
  };

  try {
    const response = await axios.post(ENV.WAAFIPAY_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data;

    return {
      success: data.responseCode === "2001",
      errorCode: data.errorCode,
      responseMsg: data.responseMsg,
      transactionId: data.params?.transactionId,
      state: data.params?.state,
      data,
    };
  } catch (error: any) {
    console.error("❌ WaafiPay Purchase Error:", error.message || error);
    return {
      success: false,
      responseMsg: "WaafiPay Connection Error",
    };
  }
};
