import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocumentVaultDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  category: string;
  documentType: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const DocumentVaultSchema = new Schema<IDocumentVaultDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ["UNVERIFIED", "VERIFIED", "REJECTED"],
      default: "UNVERIFIED",
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentVault: Model<IDocumentVaultDocument> =
  mongoose.models.DocumentVault || mongoose.model<IDocumentVaultDocument>("DocumentVault", DocumentVaultSchema);
