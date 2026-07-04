import { describe, expect, test } from "bun:test";

import {
  createProductSchema,
  updateProductSchema,
} from "./product.validate";

const valid = {
  name: "Widget",
  description: "A useful widget",
  category_id: "00000000-0000-0000-0000-000000000000",
  price: "19.99",
  stock: "10",
};

describe("createProductSchema", () => {
  test("accepts a minimal product without barcode", () => {
    const result = createProductSchema.parse(valid);
    expect(result.is_active).toBe(true);
    expect(result.barcode).toBeUndefined();
  });

  test("accepts an optional barcode", () => {
    const result = createProductSchema.parse({
      ...valid,
      barcode: "0123456789012",
    });
    expect(result.barcode).toBe("0123456789012");
  });

  test("trims a barcode with surrounding whitespace", () => {
    const result = createProductSchema.parse({
      ...valid,
      barcode: "  ABC-123  ",
    });
    expect(result.barcode).toBe("ABC-123");
  });

  test("rejects a barcode over 64 chars", () => {
    const result = createProductSchema.safeParse({
      ...valid,
      barcode: "x".repeat(65),
    });
    expect(result.success).toBe(false);
  });

  test("rejects a malformed category_id", () => {
    const result = createProductSchema.safeParse({
      ...valid,
      category_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  test("requires name, description, price, stock", () => {
    for (const field of ["name", "description", "price", "stock"] as const) {
      const bad = { ...valid, [field]: "" };
      const result = createProductSchema.safeParse(bad);
      expect(result.success).toBe(false);
    }
  });
});

describe("updateProductSchema", () => {
  test("accepts a partial update", () => {
    const result = updateProductSchema.parse({ price: 25.5 });
    expect(result.price).toBe("25.5");
  });

  test("null barcode is accepted (clearing)", () => {
    const result = updateProductSchema.parse({ barcode: null });
    expect(result.barcode).toBeNull();
  });

  test("rejects negative price", () => {
    const result = updateProductSchema.safeParse({ price: -1 });
    expect(result.success).toBe(false);
  });

  test("rejects negative stock", () => {
    const result = updateProductSchema.safeParse({ stock: -5 });
    expect(result.success).toBe(false);
  });

  test("rejects fractional stock", () => {
    const result = updateProductSchema.safeParse({ stock: 1.5 });
    expect(result.success).toBe(false);
  });
});
