"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Bot,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sliders,
  ShieldCheck,
  Zap,
  Play,
  Copy,
  Check,
} from "lucide-react";

interface MappedFieldItem {
  fieldIdentifier: string;
  label?: string;
  canonicalName: string;
  category: string;
  mappedValue: string | null;
  confidenceScore: number;
  confidenceBadge: string;
  sourceModule: string;
  isRequired: boolean;
  validationPassed: boolean;
}

interface PlanResult {
  targetPortal: string;
  totalFieldsCount: number;
  successfullyMappedCount: number;
  missingRequiredCount: number;
  overallFormReadinessScore: number;
  plan: MappedFieldItem[];
}

const PRESET_FORM_FIELDS = [
  { fieldIdentifier: "full_name", label: "Full Name", isRequired: true },
  { fieldIdentifier: "email_address", label: "Email Address", isRequired: true },
  { fieldIdentifier: "mobile_no", label: "Mobile Number", isRequired: true },
  { fieldIdentifier: "dob", label: "Date of Birth", isRequired: true },
  { fieldIdentifier: "gender", label: "Gender", isRequired: false },
  { fieldIdentifier: "highest_qualification", label: "Degree / Qualification", isRequired: true },
  { fieldIdentifier: "college_name", label: "College / University Name", isRequired: false },
  { fieldIdentifier: "current_company", label: "Current Company", isRequired: false },
  { fieldIdentifier: "upload_resume", label: "Resume CV Attachment", isRequired: true },
  { fieldIdentifier: "passport_photo", label: "Passport Photo File", isRequired: true },
];

export default function IntelligencePage() {
  const [targetPortal, setTargetPortal] = useState("UPSC / SSC Official Portal");
  const [fieldsInput, setFieldsInput] = useState(JSON.stringify(PRESET_FORM_FIELDS, null, 2));

  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setPlanResult(null);

    try {
      const parsedFields = JSON.parse(fieldsInput);
      const res = await fetch("/api/v1/intelligence/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPortal, fields: parsedFields }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPlanResult(data.data.preFillPlan);
      } else {
        setErrorMsg(data.error?.message || "Failed to generate pre-fill plan.");
      }
    } catch {
      setErrorMsg("Invalid JSON format in Form Fields input.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!planResult) return;
    navigator.clipboard.writeText(JSON.stringify(planResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <span>Smart Application Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-accent-success bg-accent-success/10 border border-accent-success/30 px-3 py-1.5 rounded-full">
          <Bot className="w-3.5 h-3.5" />
          <span>Fuzzy Field Mapping & Pre-fill Engine</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Simulator Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-4 shadow-luxury">
              <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Target Portal Form Simulator</span>
              </h3>

              {errorMsg && (
                <div className="flex items-center gap-3 p-4 rounded-md bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleGeneratePlan} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Target Portal Name</label>
                  <input
                    type="text"
                    value={targetPortal}
                    onChange={(e) => setTargetPortal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md bg-surface-1 border border-white/10 text-text-main text-sm focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Simulated Form Fields (JSON)</label>
                  <textarea
                    rows={12}
                    value={fieldsInput}
                    onChange={(e) => setFieldsInput(e.target.value)}
                    className="w-full p-4 rounded-md bg-surface-1/90 border border-white/10 text-text-main font-mono text-xs focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow w-full py-3.5 px-6 rounded-md text-white font-semibold text-sm shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{loading ? "Generating Pre-fill Strategy..." : "Generate Pre-fill Plan Payload"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Pre-fill Plan Results */}
          <div className="lg:col-span-7">
            {planResult ? (
              <div className="glass-panel p-8 rounded-lg border border-white/10 space-y-6 shadow-luxury">
                {/* Score Banner */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{planResult.targetPortal}</span>
                    <h3 className="text-lg font-bold text-text-main">Pre-fill Readiness Strategy</h3>
                    <p className="text-xs text-text-muted">
                      Mapped <strong className="text-accent-success">{planResult.successfullyMappedCount}</strong> of <strong className="text-text-main">{planResult.totalFieldsCount}</strong> form fields cleanly.
                    </p>
                  </div>

                  <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-accent-success bg-accent-success/10 shadow-glow">
                    <span className="text-base font-extrabold text-accent-success">{planResult.overallFormReadinessScore}%</span>
                  </div>
                </div>

                {/* Plan Output Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Field Mapping Table</h4>
                    <button
                      onClick={handleCopyJson}
                      className="px-3 py-1 rounded bg-surface-1 border border-white/10 text-[11px] font-semibold text-text-muted hover:text-text-main flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-accent-success" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? "Copied JSON" : "Copy Payload JSON"}</span>
                    </button>
                  </div>

                  <div className="border border-white/10 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-1 text-text-muted font-bold border-b border-white/10 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Target Field</th>
                          <th className="p-3">Canonical Match</th>
                          <th className="p-3">Value</th>
                          <th className="p-3">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {planResult.plan.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-1/50 transition-colors">
                            <td className="p-3 font-mono text-text-main font-semibold">{item.fieldIdentifier}</td>
                            <td className="p-3 text-text-muted">{item.canonicalName}</td>
                            <td className="p-3 font-mono truncate max-w-[120px]" title={item.mappedValue || "Missing"}>
                              {item.mappedValue ? <span className="text-accent-success">✓ {item.mappedValue}</span> : <span className="text-accent-danger">✗ Missing</span>}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.confidenceScore === 100 ? "bg-accent-success/10 text-accent-success border border-accent-success/30" : "bg-accent-danger/10 text-accent-danger border border-accent-danger/30"
                              }`}>
                                {item.confidenceScore}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-12 rounded-lg border border-white/10 text-center text-text-subtle text-xs space-y-3">
                <FileCode className="w-12 h-12 text-text-subtle mx-auto opacity-50" />
                <p className="font-semibold text-text-main">Ready for Form Strategy Generation</p>
                <p>Click "Generate Pre-fill Plan Payload" to test fuzzy DOM field mapping against Master Profile (M02) and Vault (M03).</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
