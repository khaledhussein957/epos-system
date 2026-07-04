import { IOrder } from ".";
import { CreateCustomerPayload } from "./customer.types";

export type PaymentMethod = "cash" | "card" | "mobile" | "bank";

export interface OrderItemInput {
  product_id: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customer_id?: string;
  customer_info?: CreateCustomerPayload;

  payment_method: PaymentMethod;
  payment_account?: string;

  discount?: number;
  tax?: number;

  items: OrderItemInput[];
}

export interface CreateOrderResponse {
  message: string;
  order: IOrder;
  receiptUrl?: string;
}
