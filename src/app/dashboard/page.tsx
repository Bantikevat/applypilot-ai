"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, LogOut, UserCheck, Briefcase, FileText, CheckCircle2, ShieldCheck, FolderOpen, Zap, BookOpen, Bot, TrendingUp, Bell, CreditCard } from "lucide-react";

interface UserSession {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-text-main font-sans">
        <div className="flex items-center gap-3 text-lg font-medium glass-panel p-6 rounded-md">
          <Sparkles className="w-6 h-6 text-primary animate-spin" />
          <span>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/20 text-primary border border-primary/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent-success">
            ApplyPilot AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-1 px-3 py-1.5 rounded-full border border-white/5">
            <UserCheck className="w-3.5 h-3.5 text-accent-success" />
            <span>{user?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-md glass-panel glass-panel-hover text-text-muted hover:text-accent-danger transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Welcome Banner */}
        <div className="glass-panel p-8 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-surface-1 to-secondary/10 space-y-4 shadow-luxury">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="w-4 h-4" />
            <span>Candidate Career Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
            Welcome back, <span className="text-primary">{user?.fullName}</span>!
          </h1>
          <p className="text-sm text-text-muted max-w-2xl leading-relaxed">
            ApplyPilot AI is actively optimizing your career profile, document vault, and multi-source job discovery pipeline.
          </p>
        </div>

        {/* Modules Roadmap Readiness Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
            <span>Active Career Modules</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* M01 Identity Card */}
            <div className="glass-panel p-6 rounded-md border border-accent-success/30 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-success uppercase tracking-wider">Module M01</span>
                <CheckCircle2 className="w-5 h-5 text-accent-success" />
              </div>
              <h3 className="text-base font-semibold text-text-main">Identity & Account</h3>
              <p className="text-xs text-text-muted">User Registration, Login, Security Rate Limiter & HttpOnly Cookies.</p>
              <div className="text-xs font-semibold text-accent-success bg-accent-success/10 px-2.5 py-1 rounded-sm w-fit">
                Status: Complete & Active
              </div>
            </div>

            {/* M02 Master Profile Card */}
            <Link
              href="/dashboard/profile"
              className="glass-panel glass-panel-hover p-6 rounded-md border border-primary/30 space-y-3 relative block group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Module M02</span>
                <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-base font-semibold text-text-main group-hover:text-primary transition-colors">Master Career Profile</h3>
              <p className="text-xs text-text-muted">Single source of truth for personal data, education, work & skills.</p>
              <div className="text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-sm w-fit flex items-center gap-1">
                <span>Manage Profile</span>
                <span className="text-xs">→</span>
              </div>
            </Link>

            {/* M03 Document Vault Card */}
            <Link
              href="/dashboard/vault"
              className="glass-panel glass-panel-hover p-6 rounded-md border border-secondary/30 space-y-3 relative block group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">Module M03</span>
                <FolderOpen className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-base font-semibold text-text-main group-hover:text-secondary transition-colors">Document Vault</h3>
              <p className="text-xs text-text-muted">Secure encrypted storage for resumes, ID cards, marksheets & photos.</p>
              <div className="text-xs font-semibold text-secondary bg-secondary/10 border border-secondary/30 px-2.5 py-1 rounded-sm w-fit flex items-center gap-1">
                <span>Open Document Vault</span>
                <span className="text-xs">→</span>
              </div>
            </Link>

            {/* M04 Asset Engine Card */}
            <Link
              href="/dashboard/assets"
              className="glass-panel glass-panel-hover p-6 rounded-md border border-accent-warning/30 space-y-3 relative block group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-warning uppercase tracking-wider">Module M04</span>
                <Zap className="w-5 h-5 text-accent-warning group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-base font-semibold text-text-main group-hover:text-accent-warning transition-colors">Photo & Signature Studio</h3>
              <p className="text-xs text-text-muted">Auto-resizer & KB compressor for SSC, UPSC & IBPS recruitment portals.</p>
              <div className="text-xs font-semibold text-accent-warning bg-accent-warning/10 border border-accent-warning/30 px-2.5 py-1 rounded-sm w-fit flex items-center gap-1">
                <span>Open Asset Studio</span>
                <span className="text-xs">→</span>
              </div>
            </Link>

            {/* M15 SaaS Billing & Subscription Card */}
            <Link
              href="/dashboard/billing"
              className="glass-panel glass-panel-hover p-6 rounded-md border border-accent-success/30 space-y-3 relative block group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-success uppercase tracking-wider">Module M15</span>
                <CreditCard className="w-5 h-5 text-accent-success group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-base font-semibold text-text-main group-hover:text-accent-success transition-colors">SaaS Billing & Subscriptions</h3>
              <p className="text-xs text-text-muted">Tier plans, metered usage limits, tier upgrades & billing invoice history.</p>
              <div className="text-xs font-semibold text-accent-success bg-accent-success/10 border border-accent-success/30 px-2.5 py-1 rounded-sm w-fit flex items-center gap-1">
                <span>View Plans & Billing</span>
                <span className="text-xs">→</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
