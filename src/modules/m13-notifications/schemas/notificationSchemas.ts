import { z } from "zod";

export const notificationCategoryEnum = z.enum([
  "DEADLINE_REMINDER",
  "JOB_MATCH_ALERT",
  "APPLICATION_UPDATE",
  "SYSTEM_ALERT",
]);

export const sendNotificationSchema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1, "Notification title is required").trim(),
  message: z.string().min(1, "Notification message is required").trim(),
  category: notificationCategoryEnum.default("SYSTEM_ALERT"),
  linkUrl: z.string().optional(),
  actionText: z.string().optional(),
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(), // Empty means mark all as read
});

export type NotificationCategory = z.infer<typeof notificationCategoryEnum>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
