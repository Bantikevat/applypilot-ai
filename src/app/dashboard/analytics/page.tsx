"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";

interface FunnelStep {
  stage: string;
  count: number;
  conversionRatePercentage: number;
}

interface PortalPerformance {
  category: string;
  totalApplied: number;
  callbacksReceived: number;
  responseRatePercentage: number;
}

interface SalaryBenchmark {
  roleId: string;
  roleTitle: string;
  minLpa: number;
  medianLpa: number;
  maxLpa: number;
  demandIndex: string;
}

interface AnalyticsData {
  profileCompletenessScore: number;
  totalApplicationsLogged: number;
  overallInterviewConversionRate: number;
  averageResponseTimeDays: number;
  weeklyApplicationVelocity: number;
  conversionFunnel: FunnelStep[];
  portalPerformance: PortalPerformance[];
  topSalaryBenchmarks: SalaryBenchmark[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/analytics/overview");
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data.analytics);
      } else {
        setErrorMsg(result.error?.message || "Failed to fetch career analytics.");
      }
    } catch {
      setErrorMsg("Network error fetching career analytics.");
    } finally {
      setLoading(false);
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
            <span>Candidate Career Analytics & Insights</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-secondary bg-secondary/10 border border-secondary/30 px-3 py-1.5 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time Funnel & Market Intelligence</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="glass-panel p-12 rounded-lg text-center text-text-subtle text-xs animate-pulse">
            Computing candidate career analytics & market benchmarks...
          </div>
        ) : data ? (
          <>
            {/* Top Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-2 shadow-luxury">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Profile Strength (PCI)</span>
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span className="text-3xl font-black text-primary">{data.profileCompletenessScore}%</span>
                <p className="text-[11px] text-text-subtle">Master Profile readiness index</p>
              </div>

              <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-2 shadow-luxury">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Interview Conversion</span>
                  <BarChart3 className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-3xl font-black text-secondary">{data.overallInterviewConversionRate}%</span>
                <p className="text-[11px] text-text-subtle">Applications converted to interviews</p>
              </div>

              <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-2 shadow-luxury">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Average Turnaround</span>
                  <Clock className="w-4 h-4 text-accent-warning" />
                </div>
                <span className="text-3xl font-black text-accent-warning">{data.averageResponseTimeDays} Days</span>
                <p className="text-[11px] text-text-subtle">Average time to initial portal callback</p>
              </div>

              <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-2 shadow-luxury">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Weekly Velocity</span>
                  <Briefcase className="w-4 h-4 text-accent-success" />
                </div>
                <span className="text-3xl font-black text-accent-success">{data.weeklyApplicationVelocity} / wk</span>
                <p className="text-[11px] text-text-subtle">Applications submitted per week</p>
              </div>
            </div>

            {/* Application Conversion Funnel */}
            <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-6 shadow-luxury">
              <div>
                <h3 className="text-base font-bold text-text-main">Application Conversion Funnel</h3>
                <p className="text-xs text-text-muted">Step-by-step candidate progression from initial submission to job offer.</p>
              </div>

              <div className="space-y-4">
                {data.conversionFunnel.map((step, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-text-main">{step.stage}</span>
                      <span className="font-mono text-primary font-bold">{step.count} ({step.conversionRatePercentage}%)</span>
                    </div>
                    <div className="w-full bg-surface-1 h-3 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, step.conversionRatePercentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Row: Portal Performance & Salary Benchmarks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Portal Breakdown */}
              <div className="lg:col-span-6 glass-panel p-6 rounded-lg border border-white/10 space-y-4 shadow-luxury">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-accent-warning" />
                  <span>Portal Callback Performance</span>
                </h3>

                <div className="space-y-3">
                  {data.portalPerformance.map((portal) => (
                    <div key={portal.category} className="p-4 rounded bg-surface-1/80 border border-white/5 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-text-main">{portal.category} Portals</h4>
                        <p className="text-[11px] text-text-subtle">{portal.totalApplied} Applications Logged</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-accent-success">{portal.responseRatePercentage}% Callback</span>
                        <p className="text-[10px] text-text-subtle">{portal.callbacksReceived} Interviews / Offers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Target Role Salary Benchmarks */}
              <div className="lg:col-span-6 glass-panel p-6 rounded-lg border border-white/10 space-y-4 shadow-luxury">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-accent-success" />
                  <span>Target Role Market Salary Intelligence</span>
                </h3>

                <div className="space-y-3">
                  {data.topSalaryBenchmarks.map((bench) => (
                    <div key={bench.roleId} className="p-4 rounded bg-surface-1/80 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-text-main">{bench.roleTitle}</h4>
                        <span className="text-[10px] font-bold text-accent-success bg-accent-success/10 px-2 py-0.5 rounded border border-accent-success/30">
                          {bench.demandIndex} DEMAND
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                        <span>Min: ₹{bench.minLpa} LPA</span>
                        <span className="text-primary font-bold">Median: ₹{bench.medianLpa} LPA</span>
                        <span>Max: ₹{bench.maxLpa} LPA</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
