import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../schemas/authSchemas";
import { AuthService } from "../services/authService";
import { checkRateLimit, resetRateLimit } from "../services/rateLimiter";

describe("M01 — Auth Schemas & AuthService Unit Tests", () => {
  it("should validate register input successfully with Zod schema", () => {
    const validData = {
      fullName: "Banti Kumar",
      email: "banti@example.com",
      password: "Password123",
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject weak password in register Zod schema", () => {
    const invalidData = {
      fullName: "Banti Kumar",
      email: "banti@example.com",
      password: "weak",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should validate login input successfully", () => {
    const validLogin = {
      email: "candidate@example.com",
      password: "Password123",
    };

    const result = loginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });

  it("should hash and verify password correctly using bcrypt", async () => {
    const password = "SuperSecretPassword123";
    const hash = await AuthService.hashPassword(password);

    expect(hash).not.toBe(password);
    const isMatch = await AuthService.comparePassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await AuthService.comparePassword("WrongPassword", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("should enforce rate limiting after 5 failed attempts", () => {
    const testIpKey = "test_ip_rate_limit_key";
    resetRateLimit(testIpKey);

    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(testIpKey, 5, 60000);
      expect(res.allowed).toBe(true);
    }

    // 6th attempt should be blocked
    const blockedRes = checkRateLimit(testIpKey, 5, 60000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.retryAfterMs).toBeGreaterThan(0);
  });
});
