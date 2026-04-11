import { IOrder, IOrderItem } from ".";
import { CreateCustomerPayload } from "./customer.types";

export interface CreateOrderPayload {
  customer_id?: number;
  customer_info?: CreateCustomerPayload;

  payment_method: string;
  payment_account: string;

  items: IOrderItem[];
}

export interface CreateOrderResponse {
  message: string;
  order: IOrder;
}
