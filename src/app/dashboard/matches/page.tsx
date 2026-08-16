"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Briefcase,
  MapPin,
  Building2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target,
} from "lucide-react";

interface CriteriaFactor {
  factor: string;
  passed: boolean;
  score: number;
  maxScore: number;
  reason: string;
}

interface JobMatch {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  matchScore: number;
  eligibilityVerdict: "ELIGIBLE" | "PARTIALLY_ELIGIBLE" | "INELIGIBLE";
  factors: CriteriaFactor[];
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/matching/matches");
      const data = await res.json();
      if (res.ok && data.success) {
        setMatches(data.data.matches || []);
        if (data.data.matches?.length > 0) {
          setSelectedMatch(data.data.matches[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load AI job matches:", err);
    } finally {
      setLoading(false);
    }
  }

  const getVerdictBadge = (verdict: JobMatch["eligibilityVerdict"]) => {
    switch (verdict) {
      case "ELIGIBLE":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-success/15 border border-accent-success/30 text-accent-success flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Eligible</span>
          </span>
        );
      case "PARTIALLY_ELIGIBLE":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-warning/15 border border-accent-warning/30 text-accent-warning flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Partial Fit</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-danger/15 border border-accent-danger/30 text-accent-danger flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>Ineligible</span>
          </span>
        );
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
            <span>AI Job Matching & Eligibility</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full">
          <Target className="w-3.5 h-3.5" />
          <span>Real-time Profile Reasoning Engine</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {loading ? (
          <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
            <span>Analyzing Candidate Profile against Open Job Opportunities...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10 space-y-3">
            <Briefcase className="w-12 h-12 text-text-subtle mx-auto" />
            <p className="font-semibold text-text-main">No active jobs found for matching</p>
            <p className="text-xs text-text-subtle">Make sure your Master Career Profile (M02) is complete.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left List Column */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Top Ranked Job Matches ({matches.length})</h3>

              <div className="space-y-3">
                {matches.map((m) => {
                  const isSelected = selectedMatch?.jobId === m.jobId;
                  return (
                    <button
                      key={m.jobId}
                      onClick={() => setSelectedMatch(m)}
                      className={`w-full p-4 rounded-lg text-left transition-all border ${
                        isSelected
                          ? "bg-primary/15 border-primary shadow-glow text-text-main"
                          : "glass-panel glass-panel-hover border-white/10 text-text-muted hover:text-text-main"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-text-main">{m.jobTitle}</h4>
                          <p className="text-xs text-text-subtle">{m.company} • {m.location}</p>
                        </div>

                        {/* Match Meter Score Pill */}
                        <div className="px-2.5 py-1 rounded-md bg-surface-1 border border-white/10 text-xs font-extrabold text-primary flex items-center gap-1">
                          <span>{m.matchScore}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[11px]">
                        {getVerdictBadge(m.eligibilityVerdict)}
                        <span className="text-primary font-semibold flex items-center gap-0.5">
                          <span>View Audit</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Factor Breakdown Audit Column */}
            <div className="lg:col-span-7">
              {selectedMatch && (
                <div className="glass-panel p-8 rounded-lg border border-white/10 space-y-6 shadow-luxury sticky top-24">
                  {/* Top Match Bar */}
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getVerdictBadge(selectedMatch.eligibilityVerdict)}
                        <span className="text-xs font-mono text-text-subtle">Match Rating</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-text-main">{selectedMatch.jobTitle}</h2>
                      <p className="text-xs font-semibold text-text-muted">{selectedMatch.company} • {selectedMatch.location}</p>
                    </div>

                    {/* Circular Score Gauge */}
                    <div className="relative w-20 h-20 flex items-center justify-center rounded-full border-4 border-primary bg-primary/10 shadow-glow">
                      <span className="text-xl font-extrabold text-primary">{selectedMatch.matchScore}%</span>
                    </div>
                  </div>

                  {/* AI Recommendation Alert */}
                  <div className="p-4 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-semibold flex items-start gap-3">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{selectedMatch.recommendation}</span>
                  </div>

                  {/* Multi-Factor Audit Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Eligibility Factor Audit</h4>

                    <div className="grid grid-cols-1 gap-2.5">
                      {selectedMatch.factors.map((f, idx) => (
                        <div key={idx} className="p-3 rounded-md bg-surface-1/70 border border-white/5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            {f.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-accent-danger flex-shrink-0" />
                            )}
                            <div>
                              <span className="font-bold text-text-main">{f.factor}: </span>
                              <span className="text-text-subtle">{f.reason}</span>
                            </div>
                          </div>

                          <span className="font-mono text-text-muted">{f.score} / {f.maxScore}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Match & Gaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    {/* Matched Skills */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-accent-success uppercase tracking-wider">Matched Skills ({selectedMatch.matchedSkills.length})</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMatch.matchedSkills.length > 0 ? (
                          selectedMatch.matchedSkills.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded bg-accent-success/10 border border-accent-success/30 text-[11px] text-accent-success font-semibold">
                              ✓ {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-text-subtle">No skills matched yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Skill Gaps */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-accent-warning uppercase tracking-wider">Missing Skill Gaps ({selectedMatch.missingSkills.length})</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMatch.missingSkills.length > 0 ? (
                          selectedMatch.missingSkills.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded bg-accent-warning/10 border border-accent-warning/30 text-[11px] text-accent-warning font-semibold">
                              ! {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-text-subtle">No skill gaps! Perfect match.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Link
                      href="/dashboard/jobs"
                      className="btn-glow w-full py-3.5 px-6 rounded-md text-white font-semibold text-xs shadow-luxury flex items-center justify-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Proceed to Job Application Portal</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
