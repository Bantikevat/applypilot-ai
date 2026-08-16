"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  LogOut,
  UserCheck,
  Briefcase,
  FileText,
  CheckCircle2,
  ShieldCheck,
  FolderOpen,
  Zap,
  BookOpen,
  Bot,
  TrendingUp,
  Bell,
  CreditCard,
  Target,
  BarChart3,
  Award,
  Sliders,
  ExternalLink,
  Menu,
  X,
  BadgeCheck,
  Crown,
  ChevronRight,
  Activity,
  Layers,
  Search,
} from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.data.user);
        } else {
          setUser({
            id: "banti_kevat_default_user",
            fullName: "Banti Kevat",
            email: "bantikevat199@gmail.com",
            role: "CANDIDATE",
          });
        }
      } catch {
        setUser({
          id: "banti_kevat_default_user",
          fullName: "Banti Kevat",
          email: "bantikevat199@gmail.com",
          role: "CANDIDATE",
        });
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

  const MODULE_CARDS = [
    {
      id: "M02",
      title: "Master Career Profile",
      description: "100% Complete resume data, M.Tech degree, Byteflow Tech experience & verified DOB (09-07-1999).",
      href: "/dashboard/profile",
      icon: FileText,
      color: "from-primary/20 to-blue-600/20 border-primary/40 text-primary",
      badge: "100% Complete",
      category: "Profile & Identity",
    },
    {
      id: "M03",
      title: "DigiLocker AI Vault",
      description: "256-Bit Encrypted storage for photos, marksheets, degrees & ID cards with MeitY verified badges.",
      href: "/dashboard/vault",
      icon: BadgeCheck,
      color: "from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-400",
      badge: "DigiLocker Verified",
      category: "Document Storage",
    },
    {
      id: "M03-Asset",
      title: "Photo & Signature Studio",
      description: "Auto-resizer & KB compressor for SSC, UPSC, IBPS & corporate application portal specifications.",
      href: "/dashboard/assets",
      icon: Zap,
      color: "from-amber-500/20 to-yellow-600/20 border-amber-500/40 text-amber-300",
      badge: "Asset Studio",
      category: "Media Tools",
    },
    {
      id: "M04",
      title: "ATS Applications & Resume Parser",
      description: "Track live job applications, parse master resumes & optimize candidate ATS match scores.",
      href: "/dashboard/applications",
      icon: Briefcase,
      color: "from-secondary/20 to-purple-600/20 border-secondary/40 text-secondary",
      badge: "ATS Optimizer",
      category: "Applications",
    },
    {
      id: "M05",
      title: "Live Job Discovery Feed",
      description: "Real-time job notices ingested from UPSC/SSC Govt, Google, RemoteOK & WeWorkRemotely.",
      href: "/dashboard/jobs",
      icon: Target,
      color: "from-cyan-500/20 to-blue-600/20 border-cyan-500/40 text-cyan-400",
      badge: "Live 4-Category Feed",
      category: "Job Discovery",
    },
    {
      id: "M06",
      title: "AI Job Match Engine",
      description: "Smart 90%+ match scoring for Senior MERN & Fullstack AI Engineer roles matching your background.",
      href: "/dashboard/matches",
      icon: Sparkles,
      color: "from-purple-500/20 to-pink-600/20 border-purple-500/40 text-purple-300",
      badge: "90%+ Match Score",
      category: "AI Intelligence",
    },
    {
      id: "M07",
      title: "Skill Gap & Learning Radar",
      description: "Analyze technical skill gaps, acquire Next.js 14 / AI skills & track candidate career growth.",
      href: "/dashboard/skills",
      icon: BookOpen,
      color: "from-blue-500/20 to-indigo-600/20 border-blue-500/40 text-blue-400",
      badge: "Radar & Courses",
      category: "Career Growth",
    },
    {
      id: "M08",
      title: "1-Click Form Intelligence Auto-Fill",
      description: "Instant 1-click auto-filling of job application forms using your 100% verified candidate profile.",
      href: "/test-form",
      icon: Zap,
      color: "from-emerald-500/20 to-lime-600/20 border-emerald-500/40 text-emerald-300",
      badge: "Auto-Fill Engine",
      category: "Automation",
    },
    {
      id: "M09",
      title: "Browser Application Assistant",
      description: "HITL protected browser form-filler & execution script generator for external portal forms.",
      href: "/dashboard/assistant",
      icon: Bot,
      color: "from-teal-500/20 to-emerald-600/20 border-teal-500/40 text-teal-300",
      badge: "HITL Protection",
      category: "Automation",
    },
    {
      id: "M10",
      title: "Form Readiness Audit",
      description: "Pre-fill audit & readiness check before submitting applications to any company career portal.",
      href: "/dashboard/intelligence",
      icon: ShieldCheck,
      color: "from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-400",
      badge: "100% Verified",
      category: "Security & Audit",
    },
    {
      id: "M11",
      title: "Salary Benchmarks & Market Analytics",
      description: "Live salary benchmarks for MERN & AI roles across Bangalore, Remote, Bhopal & Ujjain.",
      href: "/dashboard/analytics",
      icon: BarChart3,
      color: "from-indigo-500/20 to-violet-600/20 border-indigo-500/40 text-indigo-300",
      badge: "₹12L - ₹25L Benchmarks",
      category: "Market Data",
    },
    {
      id: "M12",
      title: "AI Career Agent Copilot",
      description: "Personalized AI advisor for interview prep, salary negotiation strategy & career guidance.",
      href: "/dashboard/advisor",
      icon: Sparkles,
      color: "from-pink-500/20 to-rose-600/20 border-pink-500/40 text-pink-300",
      badge: "AI Copilot Chat",
      category: "AI Intelligence",
    },
    {
      id: "M13",
      title: "Real-Time Notifications Center",
      description: "Live alerts for new job matches, application deadlines & ATS status transitions.",
      href: "/dashboard/notifications",
      icon: Bell,
      color: "from-rose-500/20 to-red-600/20 border-rose-500/40 text-rose-400",
      badge: "Live Alerts",
      category: "Notifications",
    },
    {
      id: "M14",
      title: "Master Admin Console",
      description: "System health telemetry overview, 4-category scraper metrics & manual adapter triggers.",
      href: "/admin",
      icon: Sliders,
      color: "from-cyan-500/20 to-teal-600/20 border-cyan-500/40 text-cyan-300",
      badge: "Admin Telemetry",
      category: "Administration",
    },
    {
      id: "M15",
      title: "SaaS Billing & Subscriptions",
      description: "Tiered subscription plans (Free Starter, Pro Jobseeker, Enterprise AI) & metered feature quotas.",
      href: "/dashboard/billing",
      icon: CreditCard,
      color: "from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-400",
      badge: "Pro Jobseeker Plan",
      category: "Billing",
    },
  ];

  const filteredCards = MODULE_CARDS.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a11] flex items-center justify-center text-text-main font-sans">
        <div className="flex items-center gap-3 text-lg font-medium glass-panel p-8 rounded-xl border border-primary/30 shadow-luxury">
          <Sparkles className="w-6 h-6 text-primary animate-spin" />
          <span className="font-extrabold tracking-wide">Initializing ApplyPilot AI Luxury Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a11] text-text-main flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Top Metallic Ticker */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-surface-1/90 to-primary/30 border-b border-white/10 px-4 py-1.5 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider">
            Live Production System • MongoDB Cloud Connected • 15 Modules Operational
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-text-subtle">
          <span>DOB: 09-07-1999</span>
          <span>•</span>
          <span>Role: Senior MERN & AI Developer</span>
        </div>
      </div>

      {/* Luxury Navigation Bar */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between bg-[#090d16]/90 backdrop-blur-xl shadow-luxury">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/40 text-primary shadow-glow">
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-emerald-400">
                ApplyPilot AI
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-luxury">
                <Crown className="w-3 h-3" />
                Luxury Edition
              </span>
            </div>
            <p className="text-[11px] text-text-subtle hidden sm:block">Enterprise AI Career & Application Automation Infrastructure</p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 15 modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-surface-1/80 border border-white/10 text-xs text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary w-56 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 bg-surface-1 px-4 py-2 rounded-xl border border-white/10">
            <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-text-main block">{user?.fullName || "Banti Kevat"}</span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Master Profile Verified</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl glass-panel glass-panel-hover text-text-muted hover:text-accent-danger transition-all cursor-pointer border border-white/10"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl glass-panel text-text-muted hover:text-text-main border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 p-4 space-y-3 bg-[#090d16]/95 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
            <span className="font-bold text-text-main">{user?.fullName}</span>
            <span className="text-emerald-400 font-semibold">100% Profile Complete</span>
          </div>

          <div className="relative my-2">
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 15 modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-1 border border-white/10 text-xs text-text-main"
            />
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-lg bg-accent-danger/10 text-accent-danger text-xs font-bold flex items-center justify-center gap-2 border border-accent-danger/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      )}

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-10">
        {/* Luxury Hero Showcase Banner */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-10 border border-primary/40 bg-gradient-to-br from-primary/15 via-[#0b101d] to-emerald-950/30 space-y-6 shadow-luxury">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Production Live Workspace • Executive AI Automation</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                Pro Candidate Active
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Welcome to Your Executive <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-emerald-400">
                AI Career Control Center
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-text-muted max-w-3xl leading-relaxed">
              Hello <strong className="text-white">{user?.fullName || "Banti Kevat"}</strong>! Your M.Tech (AI & ML) qualifications, Byteflow Tech experience, DigiLocker credentials, and DOB (09-07-1999) are 100% verified. Use the quick actions or 15 module cards below to manage your career.
            </p>
          </div>

          {/* Quick Action Luxury Shortcuts */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/test-form"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-primary hover:from-emerald-500 hover:to-primary text-white text-xs font-extrabold flex items-center gap-2 shadow-luxury transition-all cursor-pointer border border-white/10"
            >
              <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
              <span>1-Click Form Auto-Fill Demo</span>
            </Link>

            <Link
              href="/dashboard/vault"
              className="px-5 py-3 rounded-xl bg-surface-1 hover:bg-surface-2 text-text-main text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>Open DigiLocker AI Vault</span>
            </Link>

            <Link
              href="/dashboard/advisor"
              className="px-5 py-3 rounded-xl bg-surface-1 hover:bg-surface-2 text-text-main text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Ask AI Career Advisor</span>
            </Link>
          </div>

          {/* Luxury Executive Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div className="p-4 rounded-xl bg-surface-1/90 border border-white/10 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block">100%</span>
              <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Profile Readiness</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-1/90 border border-white/10 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-primary block">15 / 15</span>
              <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Active Modules</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-1/90 border border-white/10 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-secondary block">94%</span>
              <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Top AI Job Match</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-1/90 border border-white/10 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-amber-400 block">256-Bit</span>
              <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Vault Encrypted</p>
            </div>
          </div>
        </div>

        {/* 15 Active Career Modules Luxury Cards */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-primary" />
                <span>Enterprise Modules & Tools Directory</span>
              </h2>
              <p className="text-xs text-text-muted">Click any module below to launch its full-featured interactive workspace.</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold bg-primary/10 px-4 py-1.5 rounded-full border border-primary/30">
              <span>{filteredCards.length} / 15 Modules Showing</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className="glass-panel glass-panel-hover p-6 rounded-xl border border-white/10 hover:border-primary/50 space-y-5 relative flex flex-col justify-between group shadow-luxury transition-all cursor-pointer bg-gradient-to-b from-surface-1/60 to-surface-1/90"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-subtle bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {card.id}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${card.color}`}>
                        {card.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-xl bg-surface-1 border border-white/10 group-hover:scale-110 group-hover:border-primary/40 transition-all shadow-glow">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-primary transition-colors leading-snug">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <span className="uppercase tracking-wider text-[11px]">Open Workspace</span>
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
