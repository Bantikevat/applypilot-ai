import { describe, it, expect } from "vitest";
import { sendNotificationSchema, markReadSchema } from "../schemas/notificationSchemas";
import { NotificationService } from "../services/notificationService";

describe("M13 — Notifications Engine Unit & Service Tests", () => {
  it("should validate send notification input schema correctly", () => {
    const validReq = {
      title: "SSC CGL Application Deadline Reminder",
      message: "Application closing in 48 hours. Submit form now.",
      category: "DEADLINE_REMINDER" as const,
    };

    const res = sendNotificationSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should validate mark read request schema correctly", () => {
    const validReq = { notificationIds: ["notif_123"] };
    const res = markReadSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should emit notification, calculate unread count, and transition read state", async () => {
    const userId = "test_notif_user_123";

    // 1. Send Notification
    const notif = await NotificationService.sendNotification(userId, {
      title: "New 95% Job Match Found!",
      message: "Senior Fullstack AI Engineer at Google is open for applications.",
      category: "JOB_MATCH_ALERT",
      linkUrl: "/dashboard/matches",
      actionText: "View Match",
    });

    expect(notif._id).toBeDefined();
    expect(notif.isRead).toBe(false);

    // 2. Get User Notifications
    const { notifications, unreadCount } = await NotificationService.getUserNotifications(userId);
    expect(notifications.length).toBeGreaterThan(0);
    expect(unreadCount).toBeGreaterThan(0);

    // 3. Mark Notification as Read
    const updatedCount = await NotificationService.markAsRead(userId, [notif._id as string]);
    expect(updatedCount).toBeGreaterThan(0);

    // 4. Verify Unread Count Updated
    const updatedRes = await NotificationService.getUserNotifications(userId);
    expect(updatedRes.unreadCount).toBe(0);
  });
});
