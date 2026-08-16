"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  PlusCircle,
  Clock,
  Target,
  Award,
  Layers,
} from "lucide-react";

interface SkillGapItem {
  skillName: string;
  category: string;
  status: "MASTERED" | "CRITICAL_GAP" | "RECOMMENDED";
  candidateProficiency?: string;
  requiredProficiency: string;
  estimatedDaysToMaster: number;
  learningResourceUrl: string;
  learningResourceTitle: string;
}

interface AnalysisResult {
  roleId: string;
  roleTitle: string;
  category: string;
  skillMasteryPercentage: number;
  masteredCount: number;
  totalRequiredCount: number;
  estimatedTotalDays: number;
  masteredSkills: SkillGapItem[];
  criticalGaps: SkillGapItem[];
  recommendedGaps: SkillGapItem[];
}

const ROLES = [
  { id: "fullstack-ai", title: "Fullstack AI Engineer", category: "Engineering" },
  { id: "frontend-lead", title: "Frontend Lead / UI Architect", category: "Engineering" },
  { id: "govt-aso", title: "Assistant Section Officer (SSC ASO)", category: "Government" },
];

export default function SkillGapPage() {
  const [selectedRoleId, setSelectedRoleId] = useState("fullstack-ai");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchAnalysis(selectedRoleId);
  }, [selectedRoleId]);

  async function fetchAnalysis(roleId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/skill-gap/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalysis(data.data.analysis);
      }
    } catch (err) {
      console.error("Failed to analyze skill gap:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddSkillToProfile = async (skillName: string, proficiency: string) => {
    setAddingSkill(skillName);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/v1/skill-gap/add-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName, proficiency }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`'${skillName}' added to Master Profile!`);
        fetchAnalysis(selectedRoleId);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to add skill:", err);
    } finally {
      setAddingSkill(null);
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
            <span>Skill Gap & Learning Agent</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-secondary bg-secondary/10 border border-secondary/30 px-3 py-1.5 rounded-full">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curated Learning Roadmaps</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Status Message */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Target Role Selector Row */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Select Target Career Role Benchmark</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ROLES.map((r) => {
              const isSelected = selectedRoleId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`p-4 rounded-lg text-left transition-all border ${
                    isSelected
                      ? "bg-primary/15 border-primary shadow-glow text-text-main"
                      : "glass-panel glass-panel-hover border-white/10 text-text-muted hover:text-text-main"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-primary block">{r.category}</span>
                  <h4 className="text-sm font-bold text-text-main mt-0.5">{r.title}</h4>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Analysis Panel */}
        {loading ? (
          <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
            <span>Benchmarking Candidate Profile Skills...</span>
          </div>
        ) : analysis ? (
          <div className="space-y-8">
            {/* Top Score Banner */}
            <div className="glass-panel p-8 rounded-lg border border-white/10 bg-gradient-to-r from-primary/10 via-surface-1 to-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-luxury">
              <div className="space-y-2 text-center sm:text-left">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/20 text-primary border border-primary/30">
                  {analysis.category} Benchmark
                </span>
                <h2 className="text-2xl font-extrabold text-text-main">{analysis.roleTitle}</h2>
                <p className="text-xs text-text-muted">
                  You master <strong className="text-text-main">{analysis.masteredCount}</strong> of <strong className="text-text-main">{analysis.totalRequiredCount}</strong> target skills. Estimated time to close remaining gaps: <strong className="text-secondary">{analysis.estimatedTotalDays} days</strong>.
                </p>
              </div>

              {/* Ring Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-primary bg-primary/10 shadow-glow flex-shrink-0">
                <div className="text-center">
                  <span className="text-2xl font-extrabold text-primary">{analysis.skillMasteryPercentage}%</span>
                  <span className="text-[9px] text-text-subtle uppercase block font-semibold">Ready</span>
                </div>
              </div>
            </div>

            {/* Critical Skill Gaps Section */}
            {analysis.criticalGaps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-accent-warning uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent-warning" />
                  <span>Critical Skill Gaps ({analysis.criticalGaps.length})</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.criticalGaps.map((item, idx) => (
                    <div key={idx} className="glass-panel glass-panel-hover p-5 rounded-lg border border-accent-warning/30 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-text-main">{item.skillName}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-accent-warning/10 text-accent-warning border border-accent-warning/30">
                            Required: {item.requiredProficiency}
                          </span>
                        </div>

                        <p className="text-xs text-text-subtle flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-secondary" />
                          <span>Estimated Time to Learn: <strong className="text-text-main">{item.estimatedDaysToMaster} Days</strong></span>
                        </p>
                      </div>

                      {/* Learning Resource Card */}
                      <div className="p-3 rounded-md bg-surface-1/90 border border-white/5 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-text-subtle block">Recommended Resource</span>
                        <a
                          href={item.learningResourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          <span>{item.learningResourceTitle}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>

                      {/* One-Click Add to Profile */}
                      <button
                        onClick={() => handleAddSkillToProfile(item.skillName, item.requiredProficiency)}
                        disabled={addingSkill === item.skillName}
                        className="w-full py-2 px-3 rounded-md bg-surface-1 hover:bg-surface-2 border border-white/10 text-xs font-semibold text-text-main flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-accent-success" />
                        <span>{addingSkill === item.skillName ? "Syncing..." : "Mark Learned & Add to Master Profile"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mastered Skills Section */}
            {analysis.masteredSkills.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-accent-success uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success" />
                  <span>Mastered Skills ({analysis.masteredSkills.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {analysis.masteredSkills.map((item, idx) => (
                    <div key={idx} className="glass-panel p-4 rounded-lg border border-accent-success/30 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-text-main">{item.skillName}</h4>
                        <span className="text-[10px] text-text-subtle">Proficiency: {item.candidateProficiency}</span>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-accent-success flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
