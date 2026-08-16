import { describe, it, expect } from "vitest";
import { checkoutRequestSchema } from "../schemas/billingSchemas";
import { SaasBillingService, TIER_LIMITS } from "../services/saasBillingService";

describe("M15 — SaaS Billing & Subscription Unit & Service Tests", () => {
  it("should validate checkout upgrade schema correctly", () => {
    const validReq = { targetTier: "PRO_JOBSEEKER" as const };
    const res = checkoutRequestSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should retrieve default FREE_STARTER subscription & metered limits for candidate", async () => {
    const userId = "test_billing_user_1";
    const sub = await SaasBillingService.getUserSubscription(userId);

    expect(sub).toBeDefined();
    expect(sub.tier).toBe("FREE_STARTER");
    expect(sub.autoAppliesLimit).toBe(TIER_LIMITS.FREE_STARTER.autoApplies);
  });

  it("should generate Razorpay INR order and Stripe checkout session payloads", () => {
    const rzpOrder = SaasBillingService.createRazorpayOrderPayload("PRO_JOBSEEKER");
    expect(rzpOrder.orderId).toContain("rzp_order_");
    expect(rzpOrder.amountInPaisa).toBe(49900);

    const stripeCheckout = SaasBillingService.createStripeCheckoutPayload("ENTERPRISE_AI");
    expect(stripeCheckout.sessionId).toContain("cs_test_");
    expect(stripeCheckout.amountInr).toBe(1499);
  });

  it("should process checkout upgrade to PRO_JOBSEEKER tier and generate paid invoice record", async () => {
    const userId = "test_billing_user_2";
    const { subscription, invoice } = await SaasBillingService.processCheckoutUpgrade(userId, "PRO_JOBSEEKER");

    expect(subscription.tier).toBe("PRO_JOBSEEKER");
    expect(subscription.autoAppliesLimit).toBe(TIER_LIMITS.PRO_JOBSEEKER.autoApplies);
    expect(invoice.amountInr).toBe(499);
    expect(invoice.status).toBe("PAID");
  });

  it("should verify entitlement checks and consume feature quota", async () => {
    const userId = "test_billing_user_3";
    const isEntitled = await SaasBillingService.checkFeatureEntitlement(userId, "autoApplies");
    expect(isEntitled).toBe(true);

    const consumed = await SaasBillingService.consumeFeatureQuota(userId, "autoApplies", 1);
    expect(consumed).toBe(true);
  });
});
