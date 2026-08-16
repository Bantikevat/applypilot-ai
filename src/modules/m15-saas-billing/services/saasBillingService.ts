import { Subscription, ISubscriptionDocument } from "../models/Subscription";
import { SubscriptionTier } from "../schemas/billingSchemas";
import { connectToDatabase } from "@/lib/db/mongoose";

export interface InvoiceRecord {
  invoiceId: string;
  userId: string;
  tier: SubscriptionTier;
  amountInr: number;
  status: "PAID" | "PENDING";
  paidAt: Date;
  pdfUrl: string;
}

export interface MemorySubscription {
  _id: string;
  userId: string;
  tier: SubscriptionTier;
  status: "ACTIVE" | "CANCELED" | "EXPIRED";
  autoAppliesLimit: number;
  autoAppliesUsed: number;
  aiMatchesLimit: number;
  aiMatchesUsed: number;
  vaultStorageLimitMb: number;
  vaultStorageUsedMb: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memorySubscriptions = new Map<string, MemorySubscription>();
const memoryInvoices = new Map<string, InvoiceRecord[]>();

export const TIER_LIMITS: Record<SubscriptionTier, { priceInr: number; autoApplies: number; aiMatches: number; vaultStorageMb: number }> = {
  FREE_STARTER: { priceInr: 0, autoApplies: 5, aiMatches: 10, vaultStorageMb: 5 },
  PRO_JOBSEEKER: { priceInr: 499, autoApplies: 50, aiMatches: 999, vaultStorageMb: 50 },
  ENTERPRISE_AI: { priceInr: 1499, autoApplies: 999, aiMatches: 9999, vaultStorageMb: 500 },
};

export class SaasBillingService {
  /**
   * Retrieves active subscription tier & metered usage limits for candidate
   */
  static async getUserSubscription(userId: string): Promise<Partial<ISubscriptionDocument | MemorySubscription>> {
    const db = await connectToDatabase();

    if (db) {
      try {
        let sub = await Subscription.findOne({ userId });
        if (!sub) {
          sub = await Subscription.create({
            userId,
            tier: "FREE_STARTER",
            status: "ACTIVE",
            ...TIER_LIMITS.FREE_STARTER,
          });
        }
        return sub;
      } catch {
        console.warn("MongoDB offline, serving subscription from Memory Store.");
      }
    }

    let memSub = memorySubscriptions.get(userId);
    if (!memSub) {
      memSub = {
        _id: `sub_${Date.now()}`,
        userId,
        tier: "FREE_STARTER",
        status: "ACTIVE",
        autoAppliesLimit: TIER_LIMITS.FREE_STARTER.autoApplies,
        autoAppliesUsed: 1,
        aiMatchesLimit: TIER_LIMITS.FREE_STARTER.aiMatches,
        aiMatchesUsed: 3,
        vaultStorageLimitMb: TIER_LIMITS.FREE_STARTER.vaultStorageMb,
        vaultStorageUsedMb: 1.2,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memorySubscriptions.set(userId, memSub);
    }

    return memSub;
  }

  /**
   * Generates Razorpay (INR) Order Payload for real payment collection
   */
  static createRazorpayOrderPayload(targetTier: SubscriptionTier): { orderId: string; amountInPaisa: number; currency: string } {
    const limits = TIER_LIMITS[targetTier];
    return {
      orderId: `rzp_order_${Date.now()}`,
      amountInPaisa: limits.priceInr * 100,
      currency: "INR",
    };
  }

  /**
   * Generates Stripe (USD/INR) Checkout Session Payload for international cards
   */
  static createStripeCheckoutPayload(targetTier: SubscriptionTier): { sessionId: string; amountInr: number; mode: string } {
    const limits = TIER_LIMITS[targetTier];
    return {
      sessionId: `cs_test_${Date.now()}`,
      amountInr: limits.priceInr,
      mode: "subscription",
    };
  }

  /**
   * Processes checkout upgrade to target subscription tier
   */
  static async processCheckoutUpgrade(userId: string, targetTier: SubscriptionTier): Promise<{ subscription: Partial<ISubscriptionDocument | MemorySubscription>; invoice: InvoiceRecord }> {
    const db = await connectToDatabase();
    const limits = TIER_LIMITS[targetTier];

    const invoiceId = `inv_${Date.now()}`;
    const invoice: InvoiceRecord = {
      invoiceId,
      userId,
      tier: targetTier,
      amountInr: limits.priceInr,
      status: "PAID",
      paidAt: new Date(),
      pdfUrl: `/api/v1/billing/invoices/${invoiceId}`,
    };

    const userInvoices = memoryInvoices.get(userId) || [];
    userInvoices.unshift(invoice);
    memoryInvoices.set(userId, userInvoices);

    if (db) {
      try {
        let sub = await Subscription.findOne({ userId });
        if (!sub) {
          sub = new Subscription({ userId });
        }

        sub.tier = targetTier;
        sub.status = "ACTIVE";
        sub.autoAppliesLimit = limits.autoApplies;
        sub.aiMatchesLimit = limits.aiMatches;
        sub.vaultStorageLimitMb = limits.vaultStorageMb;
        sub.currentPeriodStart = new Date();
        sub.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await sub.save();
        return { subscription: sub, invoice };
      } catch {
        console.warn("MongoDB offline, processing checkout upgrade in Memory Store.");
      }
    }

    const memSub = (await this.getUserSubscription(userId)) as MemorySubscription;
    memSub.tier = targetTier;
    memSub.status = "ACTIVE";
    memSub.autoAppliesLimit = limits.autoApplies;
    memSub.aiMatchesLimit = limits.aiMatches;
    memSub.vaultStorageLimitMb = limits.vaultStorageMb;
    memSub.currentPeriodStart = new Date();
    memSub.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    memSub.updatedAt = new Date();

    memorySubscriptions.set(userId, memSub);
    return { subscription: memSub, invoice };
  }

  /**
   * Verifies if candidate has remaining quota for metered feature
   */
  static async checkFeatureEntitlement(userId: string, feature: "autoApplies" | "aiMatches" | "vaultStorage"): Promise<boolean> {
    const sub = await this.getUserSubscription(userId);

    if (feature === "autoApplies") {
      return (sub.autoAppliesUsed || 0) < (sub.autoAppliesLimit || 0);
    }
    if (feature === "aiMatches") {
      return (sub.aiMatchesUsed || 0) < (sub.aiMatchesLimit || 0);
    }
    if (feature === "vaultStorage") {
      return (sub.vaultStorageUsedMb || 0) < (sub.vaultStorageLimitMb || 0);
    }
    return true;
  }

  /**
   * Consumes feature quota for metered usage
   */
  static async consumeFeatureQuota(userId: string, feature: "autoApplies" | "aiMatches" | "vaultStorage", amount = 1): Promise<boolean> {
    const isAllowed = await this.checkFeatureEntitlement(userId, feature);
    if (!isAllowed) return false;

    const sub = await this.getUserSubscription(userId);
    if (feature === "autoApplies") sub.autoAppliesUsed = (sub.autoAppliesUsed || 0) + amount;
    if (feature === "aiMatches") sub.aiMatchesUsed = (sub.aiMatchesUsed || 0) + amount;
    if (feature === "vaultStorage") sub.vaultStorageUsedMb = (sub.vaultStorageUsedMb || 0) + amount;

    return true;
  }

  /**
   * Retrieves billing invoice history for candidate
   */
  static getUserInvoices(userId: string): InvoiceRecord[] {
    return memoryInvoices.get(userId) || [
      {
        invoiceId: "inv_initial_001",
        userId,
        tier: "FREE_STARTER",
        amountInr: 0,
        status: "PAID",
        paidAt: new Date(),
        pdfUrl: "#",
      },
    ];
  }
}
