import { users } from "./user.model";
import { products } from "./product.model";
import { categories } from "./catgory.model";
import { orders } from "./orders.model";
import { orderItems } from "./ordetItems.model";
import { customers } from "./customers.model";

export const schema = {
  users,
  products,
  categories,
  orders,
  orderItems,
  customers,
};

export const relations = {
  users: {
    orders: {
      relation: "hasMany",
      target: "orders",
      fields: ["id"],
    },
  },
  products: {
    category: {
      relation: "belongsTo",
      target: "categories",
      fields: ["category_id"],
    },
  },
  categories: {
    products: {
      relation: "hasMany",
      target: "products",
      fields: ["id"],
    },
  },
  orders: {
    user: {
      relation: "belongsTo",
      target: "users",
      fields: ["user_id"],
    },
    customer: {
      relation: "belongsTo",
      target: "customers",
      fields: ["customer_id"],
    },
    orderItems: {
      relation: "hasMany",
      target: "orderItems",
      fields: ["id"],
    },
  },
  orderItems: {
    order: {
      relation: "belongsTo",
      target: "orders",
      fields: ["order_id"],
    },
    product: {
      relation: "belongsTo",
      target: "products",
      fields: ["product_id"],
    },
  },
  customers: {
    orders: {
      relation: "hasMany",
      target: "orders",
      fields: ["id"],
    },
  },
};
