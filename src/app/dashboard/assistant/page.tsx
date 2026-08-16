"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  Copy,
  Check,
  Lock,
  ExternalLink,
  Code,
  UserCheck,
} from "lucide-react";

interface PlanItem {
  fieldIdentifier: string;
  canonicalName: string;
  mappedValue: string | null;
  confidenceScore: number;
  confidenceBadge: string;
  sourceModule: string;
  isRequired: boolean;
}

interface AssistantSession {
  sessionId: string;
  targetPortalUrl: string;
  portalName: string;
  currentStep: "SESSION_STARTED" | "PRE_FILL_GENERATED" | "AWAITING_HUMAN_REVIEW" | "APPROVED_FOR_SUBMIT";
  hitlProtectionActive: boolean;
  preFillPlan: {
    targetPortal: string;
    totalFieldsCount: number;
    successfullyMappedCount: number;
    overallFormReadinessScore: number;
    plan: PlanItem[];
  };
  candidateApproved: boolean;
  injectionScript: string;
}

export default function AssistantPage() {
  const [session, setSession] = useState<AssistantSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Field edit states
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});

  useEffect(() => {
    startNewSession();
  }, []);

  const startNewSession = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/assistant/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPortalUrl: "https://ssc.gov.in/apply",
          portalName: "SSC CGL Official Application Portal",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSession(data.data.session);
        // Initialize edited fields with current mapped values
        const initialEdits: Record<string, string> = {};
        for (const item of data.data.session.preFillPlan.plan) {
          if (item.mappedValue) {
            initialEdits[item.fieldIdentifier] = item.mappedValue;
          }
        }
        setEditedFields(initialEdits);
      } else {
        setErrorMsg(data.error?.message || "Failed to start assistant session.");
      }
    } catch {
      setErrorMsg("Network error starting assistant session.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldIdentifier: string, value: string) => {
    setEditedFields((prev) => ({ ...prev, [fieldIdentifier]: value }));
  };

  const handleConfirmStep = async (candidateApproved: boolean) => {
    if (!session) return;
    setApproving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/assistant/confirm-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          modifiedFields: editedFields,
          candidateApproved,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSession(data.data.session);
        setSuccessMsg(data.message || "Form data approved! Injection script is ready.");
      } else {
        setErrorMsg(data.error?.message || "Failed to confirm HITL step.");
      }
    } catch {
      setErrorMsg("Network error confirming step.");
    } finally {
      setApproving(false);
    }
  };

  const handleCopyScript = () => {
    if (!session?.injectionScript) return;
    navigator.clipboard.writeText(session.injectionScript);
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
            <span>Browser Application Assistant (HITL)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-accent-success bg-accent-success/10 border border-accent-success/30 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5" />
          <span>Human-In-The-Loop Protected</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Status Messages */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* HITL Safety Banner */}
        <div className="glass-panel p-6 rounded-lg border border-accent-warning/30 bg-gradient-to-r from-accent-warning/10 via-surface-1 to-primary/10 flex items-center justify-between gap-6 shadow-luxury">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent-warning/20 text-accent-warning border border-accent-warning/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main">Constitution HITL Safety Protocol Active</h3>
              <p className="text-xs text-text-muted">
                Assistant pre-fills form data but NEVER submits payments or final forms automatically. Final submit click is reserved for human verification.
              </p>
            </div>
          </div>

          <button
            onClick={startNewSession}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-surface-1 hover:bg-surface-2 border border-white/10 text-xs font-semibold text-text-main flex items-center gap-1.5 flex-shrink-0"
          >
            <Play className="w-3.5 h-3.5 text-primary" />
            <span>New Assistant Session</span>
          </button>
        </div>

        {/* Workflow Progress Steps */}
        {session && (
          <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-6 shadow-luxury">
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between text-xs font-semibold border-b border-white/10 pb-4">
              <div className={`flex items-center gap-2 ${session.currentStep === "SESSION_STARTED" ? "text-primary" : "text-accent-success"}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>1. Session Started</span>
              </div>

              <div className={`flex items-center gap-2 ${session.currentStep === "AWAITING_HUMAN_REVIEW" ? "text-accent-warning font-bold animate-pulse" : "text-accent-success"}`}>
                <UserCheck className="w-4 h-4" />
                <span>2. Candidate HITL Review</span>
              </div>

              <div className={`flex items-center gap-2 ${session.candidateApproved ? "text-accent-success font-bold" : "text-text-subtle"}`}>
                <Lock className="w-4 h-4" />
                <span>3. Form Auto-Fill Injection</span>
              </div>
            </div>

            {/* Candidate HITL Field Review Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-main">Human Review & Edit Gate</h3>
                  <p className="text-xs text-text-subtle">Review mapped values below. You can modify any value before approving form injection.</p>
                </div>

                <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded">
                  Target: {session.portalName}
                </span>
              </div>

              <div className="border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-1 text-text-muted font-bold border-b border-white/10 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Form Field</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Candidate Verified Value (Editable)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {session.preFillPlan.plan.map((item) => (
                      <tr key={item.fieldIdentifier} className="hover:bg-surface-1/50 transition-colors">
                        <td className="p-3 font-semibold text-text-main">{item.canonicalName} ({item.fieldIdentifier})</td>
                        <td className="p-3 text-text-subtle">{item.sourceModule}</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editedFields[item.fieldIdentifier] || ""}
                            onChange={(e) => handleFieldChange(item.fieldIdentifier, e.target.value)}
                            placeholder="Enter value..."
                            className="w-full px-3 py-1.5 rounded bg-surface-1/90 border border-white/10 text-text-main font-mono text-xs focus:border-primary"
                          />
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            editedFields[item.fieldIdentifier] ? "bg-accent-success/10 text-accent-success border border-accent-success/30" : "bg-accent-danger/10 text-accent-danger border border-accent-danger/30"
                          }`}>
                            {editedFields[item.fieldIdentifier] ? "Ready" : "Missing"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Approval Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <a
                  href={session.targetPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-md glass-panel glass-panel-hover text-xs font-semibold text-text-main flex items-center gap-1.5"
                >
                  <span>Open Official Application Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                </a>

                <button
                  onClick={() => handleConfirmStep(true)}
                  disabled={approving}
                  className="btn-glow px-6 py-2.5 rounded-md text-white font-bold text-xs shadow-luxury disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{approving ? "Approving HITL Step..." : "Approve Data & Generate Form Fill Script"}</span>
                </button>
              </div>
            </div>

            {/* Injection Script Display (After Approval) */}
            {session.candidateApproved && (
              <div className="p-6 rounded-lg bg-surface-1/90 border border-accent-success/30 space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-accent-success uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-4 h-4" />
                    <span>Auto-Fill Injection Payload (HITL Approved)</span>
                  </h4>

                  <button
                    onClick={handleCopyScript}
                    className="px-3 py-1 rounded bg-surface-1 border border-white/10 text-[11px] font-semibold text-text-muted hover:text-text-main flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-accent-success" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied Script" : "Copy Script"}</span>
                  </button>
                </div>

                <pre className="p-4 rounded bg-background border border-white/10 font-mono text-xs text-text-muted overflow-x-auto max-h-48">
                  {session.injectionScript}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
