import { ICustomer, IOrder } from ".";

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email: string;
}

export interface UpdateCustomerPayload {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface CustomerHistoryResponse {
  customer: ICustomer;
  orderCount: number;
  lifetimeSpend: number;
  orders: IOrder[];
}
