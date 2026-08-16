import { describe, it, expect } from "vitest";
import { sendNotificationSchema } from "../schemas/notificationSchemas";
import { NotificationService } from "../services/notificationService";

describe("M13 — Notifications Engine Unit & Service Tests", () => {
  it("should validate send notification schema correctly", () => {
    const validReq = {
      title: "New Job Match",
      message: "You have a new 90% job match",
      category: "JOB_MATCH_ALERT" as const,
    };
    const res = sendNotificationSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should emit notification, calculate unread count, and transition read state", async () => {
    const userId = "test_notif_user_1";

    // 1. Emit notification
    const notif = await NotificationService.sendNotification(userId, {
      title: "Deadline Reminder",
      message: "UPSC CHSL application closes in 24 hours.",
      category: "DEADLINE_REMINDER",
    });

    expect(notif._id).toBeDefined();

    // 2. Fetch notifications and check unread count
    const { notifications, unreadCount } = await NotificationService.getUserNotifications(userId);
    expect(notifications.length).toBeGreaterThan(0);
    expect(unreadCount).toBeGreaterThan(0);

    // 3. Mark notification as read
    const marked = await NotificationService.markAsRead(userId, [notif._id as string]);
    expect(marked).toBe(1);
  });

  it("should trigger automated helpers for Job Match, Deadline Reminder, and Status Update alerts", async () => {
    const userId = "test_notif_helpers_user";

    const notif1 = await NotificationService.triggerJobMatchAlert(userId, "Senior AI Engineer", "Google", 95, "job_123");
    expect(notif1.title).toContain("95% Match");

    const notif2 = await NotificationService.triggerDeadlineReminder(userId, "Assistant Section Officer", "SSC", new Date());
    expect(notif2.title).toContain("Application Deadline");

    const notif3 = await NotificationService.triggerStatusUpdateAlert(userId, "Fullstack Lead", "Microsoft", "APPLIED", "INTERVIEW_SCHEDULED");
    expect(notif3.title).toContain("Status Update");
  });
});
