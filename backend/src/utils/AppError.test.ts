import { describe, expect, test } from "bun:test";

import { AppError } from "./AppError";

describe("AppError", () => {
  test("carries message and status", () => {
    const err = new AppError("Nope", 403);
    expect(err.message).toBe("Nope");
    expect(err.status).toBe(403);
  });

  test("is an instance of Error", () => {
    const err = new AppError("Boom", 500);
    expect(err).toBeInstanceOf(Error);
  });

  test("has name AppError so instanceof/typeof checks work", () => {
    const err = new AppError("Nope", 400);
    expect(err.name).toBe("AppError");
  });

  test("stack trace includes call site", () => {
    const err = new AppError("Trace me", 500);
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("AppError.test.ts");
  });
});
