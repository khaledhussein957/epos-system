import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../config/db";
import { orders } from "../models/orders.model";
import { orderItems } from "../models/orderItems.model";
import { products } from "../models/product.model";
import { customers } from "../models/customers.model";
import { AppError } from "../utils/AppError";
import type { CreateOrderInput } from "../validations/order.validate";

export const getOrders = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "admin") {
    throw new AppError("Forbidden: admin role required", 403);
  }

  const userOrders = await db.query.orders.findMany({
    with: {
      orderItems: {
        with: {
          product: true,
        },
      },
      customer: true,
    },
    orderBy: (orders, { desc }) => [desc(orders.created_at)],
  });

  return userOrders;
};

export const processTransaction = async (
  userId: string,
  input: CreateOrderInput,
) => {
  return await db.transaction(async (tx) => {
    let customerId = input.customer_id;

    // 1. Handle Customer Logic
    if (!customerId && input.customer_info) {
      // Check if customer already exists by phone or email
      const existingCustomer = await tx.query.customers.findFirst({
        where: (customers, { or, eq }) =>
          or(
            eq(customers.phone, input.customer_info!.phone),
            eq(customers.email, input.customer_info!.email),
          ),
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const customersInserted = await tx
          .insert(customers)
          .values({
            name: input.customer_info.name,
            phone: input.customer_info.phone,
            email: input.customer_info.email,
          })
          .returning();
        const newCustomer = customersInserted[0];
        if (!newCustomer) throw new Error("Failed to create customer");
        customerId = newCustomer.id;
      }
    }

    // 2. Validate Products and Stock
    const productIds = input.items.map((item) => item.product_id);
    const dbProducts = await tx
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    if (dbProducts.length !== productIds.length) {
      throw new AppError("One or more products not found", 404);
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let subtotal = 0;

    for (const item of input.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for product: ${product.name}`,
          409,
        );
      }

      subtotal += Number(product.price) * item.quantity;
    }

    const discount = input.discount ?? 0;
    const tax = input.tax ?? 0;

    if (discount > subtotal) {
      throw new AppError("Discount cannot exceed subtotal", 400);
    }

    const total = Math.max(subtotal - discount + tax, 0);

    // 3. Create Order
    const ordersInserted = await tx
      .insert(orders)
      .values({
        user_id: userId,
        customer_id: customerId as string,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        payment_method: input.payment_method,
      })
      .returning();

    const newOrder = ordersInserted[0];
    if (!newOrder) {
      throw new AppError("Failed to create order", 500);
    }

    // 4. Create Order Items and Deduct Stock
    for (const item of input.items) {
      const product = productMap.get(item.product_id)!;

      await tx.insert(orderItems).values({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: Number(product.price).toFixed(2),
      });

      await tx
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`,
        })
        .where(eq(products.id, item.product_id));
    }

    // Fetch the created order with its items and product details for the controller
    const completeOrder = await tx.query.orders.findFirst({
      where: eq(orders.id, newOrder.id),
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
        customer: true,
      },
    });

    return completeOrder;
  });
};

export const getOrdersByUserId = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: (users) => eq(users.id, userId),
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const userOrders = await db.query.orders.findMany({
    where: eq(orders.user_id, userId),
    with: {
      orderItems: {
        with: {
          product: true,
        },
      },
      customer: true,
    },
    orderBy: (orders, { desc }) => [desc(orders.created_at)],
  });

  return userOrders;
};
