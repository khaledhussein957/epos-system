import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../config/db";
import { orders } from "../models/orders.model";
import { orderItems } from "../models/orderItems.model";
import { products } from "../models/product.model";
import { customers } from "../models/customers.model";
import type { CreateOrderInput } from "../validations/order.validate";

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
      throw new Error("One or more products not found");
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let totalAmount = 0;

    for (const item of input.items) {
      const product = productMap.get(item.product_id);
      if (!product) throw new Error(`Product ${item.product_id} not found`);

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      totalAmount += Number(product.price) * Number(item.quantity);
    }

    // 3. Create Order
    const ordersInserted = await tx
      .insert(orders)
      .values({
        user_id: userId,
        customer_id: customerId as string, // Might be undefined if anonymous allowed
        total: totalAmount.toFixed(2),
        payment_method: input.payment_method,
      })
      .returning();

    const newOrder = ordersInserted[0];
    if (!newOrder) throw new Error("Failed to create order");

    // 4. Create Order Items and Deduct Stock
    for (const item of input.items) {
      const product = productMap.get(item.product_id)!;

      await tx.insert(orderItems).values({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: Math.round(Number(product.price) * 100), // Storing as cents in order_items if it's integer
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
    return {
      message: "User not found",
    };
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
