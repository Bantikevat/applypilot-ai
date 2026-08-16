"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Zap,
  CheckCheck,
  Briefcase,
  Calendar,
} from "lucide-react";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  category: "DEADLINE_REMINDER" | "JOB_MATCH_ALERT" | "APPLICATION_UPDATE" | "SYSTEM_ALERT";
  isRead: boolean;
  linkUrl?: string;
  actionText?: string;
  createdAt: string;
}

const CATEGORY_BADGES: Record<string, { label: string; style: string }> = {
  DEADLINE_REMINDER: { label: "Deadline Alert", style: "bg-accent-danger/10 text-accent-danger border-accent-danger/30" },
  JOB_MATCH_ALERT: { label: "Job Match", style: "bg-accent-success/10 text-accent-success border-accent-success/30" },
  APPLICATION_UPDATE: { label: "ATS Update", style: "bg-primary/10 text-primary border-primary/30" },
  SYSTEM_ALERT: { label: "System Notice", style: "bg-secondary/10 text-secondary border-secondary/30" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    fetchNotifications(activeTab);
  }, [activeTab]);

  const fetchNotifications = async (cat: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/v1/notifications?category=${cat}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      } else {
        setErrorMsg(data.error?.message || "Failed to fetch notifications.");
      }
    } catch {
      setErrorMsg("Network error fetching notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/v1/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchNotifications(activeTab);
      }
    } catch {
      console.error("Failed to mark notifications as read");
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      const res = await fetch("/api/v1/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchNotifications(activeTab);
      }
    } catch {
      console.error("Failed to mark notification as read");
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-md glass-panel glass-panel-hover text-text-muted hover:text-text-main">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Notification & Alert Center</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 rounded-md glass-panel glass-panel-hover border border-white/10 text-xs font-semibold text-text-main flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-accent-success" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full">
            <Bell className="w-3.5 h-3.5" />
            <span>{unreadCount} Unread Alerts</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-semibold">
          {[
            { id: "ALL", label: "All Alerts" },
            { id: "DEADLINE_REMINDER", label: "Deadlines" },
            { id: "JOB_MATCH_ALERT", label: "Job Matches" },
            { id: "APPLICATION_UPDATE", label: "ATS Status" },
            { id: "SYSTEM_ALERT", label: "System Notices" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white font-bold"
                  : "glass-panel glass-panel-hover text-text-muted hover:text-text-main"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="glass-panel p-12 rounded-lg text-center text-text-subtle text-xs animate-pulse">
            Fetching candidate notifications & alerts...
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => {
              const badge = CATEGORY_BADGES[n.category] || CATEGORY_BADGES.SYSTEM_ALERT;
              return (
                <div
                  key={n._id}
                  className={`glass-panel p-5 rounded-lg border transition-all shadow-luxury flex items-start justify-between gap-4 ${
                    !n.isRead ? "border-primary/40 bg-surface-1/90" : "border-white/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.style}`}>
                        {badge.label}
                      </span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                      <span className="text-[11px] text-text-subtle flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-main">{n.title}</h4>
                    <p className="text-xs text-text-muted leading-relaxed">{n.message}</p>

                    {n.linkUrl && (
                      <div className="pt-2">
                        <Link
                          href={n.linkUrl}
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 w-fit"
                        >
                          <span>{n.actionText || "View Action"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkSingleRead(n._id)}
                      className="p-1.5 rounded hover:bg-surface-2 text-text-subtle hover:text-text-main flex-shrink-0"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4 text-accent-success" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-lg text-center text-text-subtle text-xs space-y-3">
            <Bell className="w-12 h-12 text-text-subtle mx-auto opacity-50" />
            <p className="font-semibold text-text-main">No Notifications in {activeTab}</p>
            <p>You're all caught up! Deadline reminders and job match alerts will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
