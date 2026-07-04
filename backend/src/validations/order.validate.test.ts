import { describe, expect, test } from "bun:test";

import { createOrderSchema } from "./order.validate";

const validItem = {
  product_id: "00000000-0000-0000-0000-000000000000",
  quantity: 2,
};

const validPayload = {
  payment_method: "cash" as const,
  items: [validItem],
};

describe("createOrderSchema", () => {
  test("accepts a minimal cash sale", () => {
    const result = createOrderSchema.parse(validPayload);
    expect(result.items[0]?.quantity).toBe(2);
    expect(result.discount).toBe(0);
    expect(result.tax).toBe(0);
  });

  test("rejects an empty items array", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  test("coerces string quantity from the wire", () => {
    const result = createOrderSchema.parse({
      ...validPayload,
      items: [{ ...validItem, quantity: "3" }],
    });
    expect(result.items[0]?.quantity).toBe(3);
    expect(typeof result.items[0]?.quantity).toBe("number");
  });

  test("rejects fractional quantity", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      items: [{ ...validItem, quantity: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  test("rejects zero quantity", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      items: [{ ...validItem, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative quantity", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      items: [{ ...validItem, quantity: -1 }],
    });
    expect(result.success).toBe(false);
  });

  test("requires payment_account for mobile payments", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      payment_method: "mobile",
    });
    expect(result.success).toBe(false);
  });

  test("requires payment_account for bank payments", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      payment_method: "bank",
    });
    expect(result.success).toBe(false);
  });

  test("accepts mobile payment with account", () => {
    const result = createOrderSchema.parse({
      ...validPayload,
      payment_method: "mobile",
      payment_account: "+252612345678",
    });
    expect(result.payment_method).toBe("mobile");
  });

  test("empty payment_account for mobile is rejected", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      payment_method: "mobile",
      payment_account: "   ",
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative discount", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      discount: -1,
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative tax", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      tax: -0.01,
    });
    expect(result.success).toBe(false);
  });

  test("accepts positive discount and tax", () => {
    const result = createOrderSchema.parse({
      ...validPayload,
      discount: 5,
      tax: 1.25,
    });
    expect(result.discount).toBe(5);
    expect(result.tax).toBe(1.25);
  });

  test("rejects unknown payment method", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      payment_method: "crypto",
    });
    expect(result.success).toBe(false);
  });

  test("rejects malformed product_id", () => {
    const result = createOrderSchema.safeParse({
      ...validPayload,
      items: [{ product_id: "not-a-uuid", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });
});
