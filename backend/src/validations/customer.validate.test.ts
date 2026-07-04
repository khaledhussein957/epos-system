import { describe, expect, test } from "bun:test";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validate";

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+252612345678",
};

describe("createCustomerSchema", () => {
  test("accepts a valid customer", () => {
    const result = createCustomerSchema.parse(valid);
    expect(result).toEqual(valid);
  });

  test("rejects a single-character name", () => {
    const result = createCustomerSchema.safeParse({ ...valid, name: "J" });
    expect(result.success).toBe(false);
  });

  test("rejects a name over 120 characters", () => {
    const result = createCustomerSchema.safeParse({
      ...valid,
      name: "x".repeat(121),
    });
    expect(result.success).toBe(false);
  });

  test("rejects an invalid email", () => {
    const result = createCustomerSchema.safeParse({
      ...valid,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  test("rejects a phone shorter than 5 chars", () => {
    const result = createCustomerSchema.safeParse({ ...valid, phone: "123" });
    expect(result.success).toBe(false);
  });

  test("rejects a phone over 32 chars", () => {
    const result = createCustomerSchema.safeParse({
      ...valid,
      phone: "1".repeat(33),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCustomerSchema", () => {
  test("accepts empty object (all fields optional)", () => {
    expect(updateCustomerSchema.safeParse({}).success).toBe(true);
  });

  test("accepts partial patches", () => {
    const result = updateCustomerSchema.parse({ name: "New Name" });
    expect(result.name).toBe("New Name");
    expect(result.email).toBeUndefined();
  });

  test("still validates each present field", () => {
    const result = updateCustomerSchema.safeParse({
      email: "still-bad",
    });
    expect(result.success).toBe(false);
  });
});
