import { describe, expect, test } from "bun:test";

import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL_MS,
  comparePassword,
  generateRefreshToken,
  generateResetPasswordCode,
  generateToken,
  hashPassword,
  hashRefreshToken,
  isResetPasswordCodeExpired,
  refreshTokenExpiry,
  verifyToken,
} from "./auth.util";

describe("hashPassword / comparePassword", () => {
  test("hash never equals the plain password", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).not.toBe("hunter2");
    expect(hash.length).toBeGreaterThan(20);
  });

  test("matches the right password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await comparePassword("hunter2", hash)).toBe(true);
  });

  test("rejects the wrong password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await comparePassword("hunter3", hash)).toBe(false);
  });

  test("two hashes of the same password differ (salt)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});

describe("generateResetPasswordCode", () => {
  test("returns a 6-digit string", async () => {
    const code = await generateResetPasswordCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  test("covers the full 100000-999999 range", async () => {
    // 200 samples: with a uniform 6-digit range we expect >= 100 distinct
    // values. This catches the old Math.random() collision cliff.
    const samples = await Promise.all(
      Array.from({ length: 200 }, () => generateResetPasswordCode()),
    );
    const distinct = new Set(samples);
    expect(distinct.size).toBeGreaterThan(150);

    const asNumbers = samples.map(Number);
    expect(Math.min(...asNumbers)).toBeGreaterThanOrEqual(100000);
    expect(Math.max(...asNumbers)).toBeLessThanOrEqual(999999);
  });
});

describe("isResetPasswordCodeExpired", () => {
  test("false when expiry is in the future", () => {
    const future = new Date(Date.now() + 60_000);
    expect(isResetPasswordCodeExpired(future)).toBe(false);
  });

  test("true when expiry is in the past", () => {
    const past = new Date(Date.now() - 60_000);
    expect(isResetPasswordCodeExpired(past)).toBe(true);
  });
});

describe("generateRefreshToken / hashRefreshToken", () => {
  test("refresh token is a base64url string", () => {
    const token = generateRefreshToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    // 48 raw bytes → 64 base64url chars
    expect(token.length).toBe(64);
  });

  test("distinct refresh tokens on repeated calls", () => {
    const tokens = Array.from({ length: 20 }, generateRefreshToken);
    expect(new Set(tokens).size).toBe(20);
  });

  test("hashRefreshToken is deterministic and stable", () => {
    expect(hashRefreshToken("abc")).toBe(hashRefreshToken("abc"));
    expect(hashRefreshToken("abc")).not.toBe(hashRefreshToken("abd"));
    expect(hashRefreshToken("abc")).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("refreshTokenExpiry", () => {
  test("returns a Date about 30 days out", () => {
    const now = Date.now();
    const expiry = refreshTokenExpiry();
    const diff = expiry.getTime() - now;
    expect(diff).toBeGreaterThan(REFRESH_TOKEN_TTL_MS - 5_000);
    expect(diff).toBeLessThanOrEqual(REFRESH_TOKEN_TTL_MS + 100);
  });

  test("REFRESH_TOKEN_TTL_MS is exactly 30 days", () => {
    expect(REFRESH_TOKEN_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
});

describe("generateToken / verifyToken", () => {
  test("access TTL is 15 minutes", () => {
    expect(ACCESS_TOKEN_TTL).toBe("15m");
  });

  test("token round-trip returns id and role", () => {
    const token = generateToken("user-123", "cashier");
    const decoded = verifyToken(token) as { id: string; role: string };
    expect(decoded.id).toBe("user-123");
    expect(decoded.role).toBe("cashier");
  });

  test("verifyToken rejects a garbage token", () => {
    expect(() => verifyToken("not-a-jwt")).toThrow();
  });
});
