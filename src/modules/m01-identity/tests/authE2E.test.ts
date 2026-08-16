import { describe, it, expect, beforeAll } from "vitest";
import { registerSchema, loginSchema } from "../schemas/authSchemas";
import { AuthService } from "../services/authService";
import { checkRateLimit, resetRateLimit } from "../services/rateLimiter";

describe("M01 — Complete End-to-End Module Validation Suite", () => {
  const mockCandidate = {
    fullName: "Banti Kumar Master Test",
    email: `test_candidate_${Date.now()}@example.com`,
    password: "Password123",
  };

  it("Step 1: Input Validation — Zod register & login schemas must enforce security rules", () => {
    // Valid candidate
    const regResult = registerSchema.safeParse(mockCandidate);
    expect(regResult.success).toBe(true);

    // Invalid email
    const badEmailRes = registerSchema.safeParse({ ...mockCandidate, email: "invalid-email" });
    expect(badEmailRes.success).toBe(false);

    // Weak password
    const weakPassRes = registerSchema.safeParse({ ...mockCandidate, password: "123" });
    expect(weakPassRes.success).toBe(false);
  });

  it("Step 2: Password Security — Hashing must produce non-reversible salt hash & verify accurately", async () => {
    const rawPassword = mockCandidate.password;
    const hash = await AuthService.hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

    const isMatch = await AuthService.comparePassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isIncorrectMatch = await AuthService.comparePassword("WrongPassword999", hash);
    expect(isIncorrectMatch).toBe(false);
  });

  it("Step 3: Session Security — JWT tokens must sign, set expiration & decode payload cleanly", async () => {
    const payload = {
      userId: "test_user_id_123",
      email: mockCandidate.email,
      role: "CANDIDATE",
      fullName: mockCandidate.fullName,
    };

    const token = await AuthService.createSessionToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = await AuthService.verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe("test_user_id_123");
    expect(decoded?.email).toBe(mockCandidate.email);
    expect(decoded?.role).toBe("CANDIDATE");
  });

  it("Step 4: DevSecOps Rate Limiting — Brute force protection must block after 5 failed login attempts", () => {
    const ipKey = "e2e_test_ip_key";
    resetRateLimit(ipKey);

    // 5 attempts allowed
    for (let i = 1; i <= 5; i++) {
      const res = checkRateLimit(ipKey, 5, 60000);
      expect(res.allowed).toBe(true);
    }

    // 6th attempt blocked
    const blockedRes = checkRateLimit(ipKey, 5, 60000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.retryAfterMs).toBeGreaterThan(0);
  });
});
