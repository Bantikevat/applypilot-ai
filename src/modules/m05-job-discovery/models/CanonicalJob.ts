import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICanonicalJobDocument extends Document {
  title: string;
  company: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Government" | "Remote";
  workMode?: string;
  sourceCategory?: string;
  sourceAdapter?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  minExperienceYears: number;
  maxExperienceYears?: number;
  educationRequirements: string[];
  skills: string[];
  description: string;
  requirements: string[];
  applicationUrl: string;
  source: string;
  sourceUrl?: string;
  deduplicationHash: string;
  trustScore: number;
  trustBadge: "Verified Official Source" | "High Confidence" | "Needs Verification" | "Suspicious / Application Fee Warning";
  status: "ACTIVE" | "EXPIRED" | "SUSPICIOUS";
  postedAt: Date;
  collectedAt: Date;
  lastVerifiedAt: Date;
}

const CanonicalJobSchema = new Schema<ICanonicalJobDocument>(
  {
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Government", "Remote"],
      default: "Full-time",
      index: true,
    },
    workMode: { type: String, default: "On-site" },
    sourceCategory: { type: String, index: true },
    sourceAdapter: { type: String, index: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, default: "INR" },
    minExperienceYears: { type: Number, default: 0, index: true },
    maxExperienceYears: { type: Number },
    educationRequirements: [{ type: String }],
    skills: [{ type: String }],
    description: { type: String, required: true },
    requirements: [{ type: String }],
    applicationUrl: { type: String, required: true },
    source: { type: String, required: true, index: true },
    sourceUrl: { type: String },
    deduplicationHash: { type: String, required: true, unique: true, index: true },
    trustScore: { type: Number, required: true, default: 85 },
    trustBadge: {
      type: String,
      enum: [
        "Verified Official Source",
        "High Confidence",
        "Needs Verification",
        "Suspicious / Application Fee Warning",
      ],
      default: "High Confidence",
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "SUSPICIOUS"],
      default: "ACTIVE",
      index: true,
    },
    postedAt: { type: Date, default: Date.now },
    collectedAt: { type: Date, default: Date.now },
    lastVerifiedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const CanonicalJob: Model<ICanonicalJobDocument> =
  mongoose.models.CanonicalJob || mongoose.model<ICanonicalJobDocument>("CanonicalJob", CanonicalJobSchema, "canonicaljobs");
