import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriptionDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  tier: "FREE_STARTER" | "PRO_JOBSEEKER" | "ENTERPRISE_AI";
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

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["FREE_STARTER", "PRO_JOBSEEKER", "ENTERPRISE_AI"],
      default: "FREE_STARTER",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELED", "EXPIRED"],
      default: "ACTIVE",
    },
    autoAppliesLimit: { type: Number, default: 5 },
    autoAppliesUsed: { type: Number, default: 1 },
    aiMatchesLimit: { type: Number, default: 10 },
    aiMatchesUsed: { type: Number, default: 3 },
    vaultStorageLimitMb: { type: Number, default: 5 },
    vaultStorageUsedMb: { type: Number, default: 1.2 },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  },
  {
    timestamps: true,
  }
);

export const Subscription: Model<ISubscriptionDocument> =
  mongoose.models.Subscription || mongoose.model<ISubscriptionDocument>("Subscription", SubscriptionSchema);
