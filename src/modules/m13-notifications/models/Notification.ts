import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  message: string;
  category: "DEADLINE_REMINDER" | "JOB_MATCH_ALERT" | "APPLICATION_UPDATE" | "SYSTEM_ALERT";
  isRead: boolean;
  readAt?: Date;
  linkUrl?: string;
  actionText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["DEADLINE_REMINDER", "JOB_MATCH_ALERT", "APPLICATION_UPDATE", "SYSTEM_ALERT"],
      default: "SYSTEM_ALERT",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    linkUrl: {
      type: String,
    },
    actionText: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification: Model<INotificationDocument> =
  mongoose.models.Notification || mongoose.model<INotificationDocument>("Notification", NotificationSchema);
