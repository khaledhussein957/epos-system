import { ICustomer } from ".";

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email: string;
}

export interface CreateCustomerResponse {
  customer: ICustomer;
}
