export interface IUser {
  id: number;

  name: string;
  email: string;
  phone: string;

  role: string;

  profilePicture: string;

  isBlock: boolean;
  lastLogin: Date;
}

export interface ICategory {
  id: number;
  name: string;
}

export interface IProduct {
  id: number;

  name: string;
  description: string;

  category_id: number;

  price: number;
  stock: number;
  image: string;

  is_active: boolean;

  qr_code: string;

  created_at: Date;
  updated_at: Date;
}

export interface ICustomer {
  id: number;

  name: string;
  phone: string;
  email: string;

  created_at: Date;
  updated_at: Date;
}

export interface IOrderItem {
  id: number;

  order_id: number;
  product_id: number;

  quantity: number;
  price: number;

  created_at: Date;
  updated_at: Date;
}

export interface IOrder {
  id: number;

  customer_id: number;
  customer_info: string;

  payment_method: string;
  payment_account: string;

  items: IOrderItem[];

  created_at: Date;
  updated_at: Date;
}

export interface IPayment {
  id: number;

  user_id: number;
  order_id: number;

  payment_status: string;
  
  amount: number;
  phoneNo: string;

  transaction_id: string;

  created_at: Date;
  updated_at: Date;
}
