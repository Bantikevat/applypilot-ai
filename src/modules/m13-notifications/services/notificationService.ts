import { Notification, INotificationDocument } from "../models/Notification";
import { SendNotificationInput } from "../schemas/notificationSchemas";
import { connectToDatabase } from "@/lib/db/mongoose";

export interface MemoryNotification {
  _id: string;
  userId: string;
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

const memoryNotifications = new Map<string, MemoryNotification>();

export class NotificationService {
  /**
   * Emits a new notification to candidate
   */
  static async sendNotification(targetUserId: string, input: SendNotificationInput): Promise<Partial<INotificationDocument | MemoryNotification>> {
    // External Push & Email Alert Dispatcher Hook (Nodemailer / Twilio)
    if (process.env.SMTP_SERVER || process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[EXTERNAL DISPATCH] Emitting ${input.category} alert to candidate ${targetUserId}: "${input.title}"`);
    }

    const db = await connectToDatabase();

    if (db) {
      try {
        const notif = await Notification.create({
          userId: targetUserId,
          title: input.title,
          message: input.message,
          category: input.category,
          isRead: false,
          linkUrl: input.linkUrl,
          actionText: input.actionText,
        });

        return notif;
      } catch (err) {
        console.warn("MongoDB offline, saving notification in Memory Store:", err);
      }
    }

    const notifId = `notif_${Date.now()}`;
    const memNotif: MemoryNotification = {
      _id: notifId,
      userId: targetUserId,
      title: input.title,
      message: input.message,
      category: input.category,
      isRead: false,
      linkUrl: input.linkUrl,
      actionText: input.actionText,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryNotifications.set(notifId, memNotif);
    return memNotif;
  }

  /**
   * Trigger helper for high-score Job Match alerts
   */
  static async triggerJobMatchAlert(userId: string, jobTitle: string, company: string, matchScore: number, jobId?: string) {
    return this.sendNotification(userId, {
      title: `🎯 ${matchScore}% Match: ${jobTitle} at ${company}`,
      message: `A new high-score job match (${matchScore}%) was discovered for your profile.`,
      category: "JOB_MATCH_ALERT",
      linkUrl: `/dashboard/matches?jobId=${jobId || ""}`,
      actionText: "View Match Details",
    });
  }

  /**
   * Trigger helper for Application Deadline reminders
   */
  static async triggerDeadlineReminder(userId: string, jobTitle: string, company: string, deadlineDate: Date) {
    const formattedDate = new Date(deadlineDate).toLocaleDateString();
    return this.sendNotification(userId, {
      title: `⏰ Application Deadline Approaching: ${jobTitle}`,
      message: `The application deadline for ${company} is approaching on ${formattedDate}. Complete your pre-fill strategy now.`,
      category: "DEADLINE_REMINDER",
      linkUrl: "/dashboard/applications",
      actionText: "Review Application",
    });
  }

  /**
   * Trigger helper for Application Status Update alerts
   */
  static async triggerStatusUpdateAlert(userId: string, jobTitle: string, company: string, oldStatus: string, newStatus: string) {
    return this.sendNotification(userId, {
      title: `📢 Application Status Update: ${jobTitle}`,
      message: `Your application for ${company} transitioned from ${oldStatus} to ${newStatus}.`,
      category: "APPLICATION_UPDATE",
      linkUrl: "/dashboard/applications",
      actionText: "Open Candidate ATS",
    });
  }

  /**
   * Retrieves candidate notifications list and unread counter
   */
  static async getUserNotifications(userId: string, categoryFilter?: string): Promise<{ notifications: Array<Partial<INotificationDocument | MemoryNotification>>; unreadCount: number }> {
    const db = await connectToDatabase();

    if (db) {
      try {
        const query: any = { userId };
        if (categoryFilter && categoryFilter !== "ALL") {
          query.category = categoryFilter;
        }

        const notifs = await Notification.find(query).sort({ createdAt: -1 });
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        return { notifications: notifs, unreadCount };
      } catch {
        console.warn("MongoDB offline, reading notifications from Memory Store.");
      }
    }

    const results: MemoryNotification[] = [];
    let unreadCount = 0;

    for (const n of memoryNotifications.values()) {
      if (n.userId === userId) {
        if (!n.isRead) unreadCount++;
        if (!categoryFilter || categoryFilter === "ALL" || n.category === categoryFilter) {
          results.push(n);
        }
      }
    }

    const sorted = results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return { notifications: sorted, unreadCount };
  }

  /**
   * Marks specific or all notifications as read
   */
  static async markAsRead(userId: string, notificationIds?: string[]): Promise<number> {
    const db = await connectToDatabase();

    if (db) {
      try {
        if (notificationIds && notificationIds.length > 0) {
          const res = await Notification.updateMany(
            { userId, _id: { $in: notificationIds } },
            { $set: { isRead: true, readAt: new Date() } }
          );
          return res.modifiedCount;
        } else {
          const res = await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
          );
          return res.modifiedCount;
        }
      } catch {
        console.warn("MongoDB offline, updating read state in Memory Store.");
      }
    }

    let count = 0;
    for (const n of memoryNotifications.values()) {
      if (n.userId === userId && !n.isRead) {
        if (!notificationIds || notificationIds.length === 0 || notificationIds.includes(n._id)) {
          n.isRead = true;
          n.readAt = new Date();
          count++;
        }
      }
    }

    return count;
  }
}
