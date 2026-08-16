import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplicationTrackerDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  jobId?: mongoose.Types.ObjectId | string;
  jobTitle: string;
  company: string;
  applicationUrl?: string;
  status: "SAVED" | "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "OFFER_RECEIVED" | "REJECTED" | "WITHDRAWN";
  portalCategory: "Government" | "Corporate" | "Remote" | "Other";
  appliedAt: Date;
  deadlineAt?: Date;
  nextFollowUpAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationTrackerSchema = new Schema<IApplicationTrackerDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "CanonicalJob",
    },
    jobTitle: {
      type: String,
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      index: true,
    },
    applicationUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["SAVED", "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "OFFER_RECEIVED", "REJECTED", "WITHDRAWN"],
      default: "APPLIED",
      index: true,
    },
    portalCategory: {
      type: String,
      enum: ["Government", "Corporate", "Remote", "Other"],
      default: "Corporate",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    deadlineAt: {
      type: Date,
    },
    nextFollowUpAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ApplicationTracker: Model<IApplicationTrackerDocument> =
  mongoose.models.ApplicationTracker || mongoose.model<IApplicationTrackerDocument>("ApplicationTracker", ApplicationTrackerSchema);
