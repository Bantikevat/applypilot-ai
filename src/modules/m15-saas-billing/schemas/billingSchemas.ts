import { z } from "zod";

export const tierEnum = z.enum(["FREE_STARTER", "PRO_JOBSEEKER", "ENTERPRISE_AI"]);

export const checkoutRequestSchema = z.object({
  targetTier: tierEnum,
  paymentMethod: z.enum(["CARD", "UPI", "NET_BANKING", "SIMULATED_TEST"]).default("SIMULATED_TEST"),
});

export type SubscriptionTier = z.infer<typeof tierEnum>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
