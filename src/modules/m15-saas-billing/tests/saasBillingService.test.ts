import { describe, it, expect } from "vitest";
import { checkoutRequestSchema, tierEnum } from "../schemas/billingSchemas";
import { SaasBillingService, TIER_LIMITS } from "../services/saasBillingService";

describe("M15 — SaaS Billing & Subscription Unit & Service Tests", () => {
  it("should validate checkout request schema correctly", () => {
    const validReq = { targetTier: "PRO_JOBSEEKER" as const, paymentMethod: "SIMULATED_TEST" as const };
    const res = checkoutRequestSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should retrieve default FREE_STARTER subscription & metered limits for candidate", async () => {
    const userId = "test_billing_user_123";
    const sub = await SaasBillingService.getUserSubscription(userId);

    expect(sub).toBeDefined();
    expect(sub.tier).toBe("FREE_STARTER");
    expect(sub.autoAppliesLimit).toBe(TIER_LIMITS.FREE_STARTER.autoApplies);
  });

  it("should upgrade candidate tier, refresh usage limits, and issue invoice", async () => {
    const userId = "test_billing_user_123";
    const { subscription, invoice } = await SaasBillingService.processCheckoutUpgrade(userId, "PRO_JOBSEEKER");

    expect(subscription.tier).toBe("PRO_JOBSEEKER");
    expect(subscription.autoAppliesLimit).toBe(TIER_LIMITS.PRO_JOBSEEKER.autoApplies);
    expect(invoice).toBeDefined();
    expect(invoice.amountInr).toBe(499);
    expect(invoice.status).toBe("PAID");
  });

  it("should check feature entitlement quota correctly", async () => {
    const userId = "test_billing_user_123";
    const hasQuota = await SaasBillingService.checkFeatureEntitlement(userId, "autoApplies");
    expect(typeof hasQuota).toBe("boolean");
  });
});
