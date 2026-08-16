"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Briefcase,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ExternalLink,
  Trash2,
  Edit3,
  TrendingUp,
  Building,
  Filter,
} from "lucide-react";

interface Application {
  _id: string;
  jobTitle: string;
  company: string;
  applicationUrl?: string;
  status: "SAVED" | "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "OFFER_RECEIVED" | "REJECTED" | "WITHDRAWN";
  portalCategory: string;
  appliedAt: string;
  deadlineAt?: string;
  notes?: string;
}

interface Metrics {
  totalCount: number;
  savedCount: number;
  appliedCount: number;
  underReviewCount: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  offerConversionPercentage: number;
}

const STATUS_COLORS: Record<string, string> = {
  SAVED: "bg-surface-2 text-text-muted border-white/10",
  APPLIED: "bg-primary/10 text-primary border-primary/30",
  UNDER_REVIEW: "bg-accent-warning/10 text-accent-warning border-accent-warning/30",
  SHORTLISTED: "bg-accent-warning/20 text-accent-warning border-accent-warning/40",
  INTERVIEW_SCHEDULED: "bg-secondary/10 text-secondary border-secondary/30",
  OFFER_RECEIVED: "bg-accent-success/10 text-accent-success border-accent-success/30 font-bold",
  REJECTED: "bg-accent-danger/10 text-accent-danger border-accent-danger/30",
  WITHDRAWN: "bg-surface-1 text-text-subtle border-white/10",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Log Application Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    applicationUrl: "",
    status: "APPLIED" as const,
    portalCategory: "Corporate" as const,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications(activeTab);
  }, [activeTab]);

  const fetchApplications = async (tab: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/v1/applications?status=${tab}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.data.applications);
        setMetrics(data.data.metrics);
      } else {
        setErrorMsg(data.error?.message || "Failed to fetch candidate applications.");
      }
    } catch {
      setErrorMsg("Network error fetching applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Application logged successfully in Candidate ATS!");
        setShowModal(false);
        setFormData({ jobTitle: "", company: "", applicationUrl: "", status: "APPLIED", portalCategory: "Corporate", notes: "" });
        fetchApplications(activeTab);
      } else {
        setErrorMsg(data.error?.message || "Failed to log application.");
      }
    } catch {
      setErrorMsg("Network error creating application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchApplications(activeTab);
      }
    } catch {
      console.error("Failed to update status");
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this application record?")) return;
    try {
      const res = await fetch(`/api/v1/applications/${appId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchApplications(activeTab);
      }
    } catch {
      console.error("Failed to delete application");
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
            <span>Candidate Application Tracker (ATS)</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-glow py-2 px-4 rounded-md text-white font-semibold text-xs shadow-luxury flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log Application</span>
        </button>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Status Alerts */}
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

        {/* ATS Analytics Bar */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="glass-panel p-4 rounded-lg border border-white/10 text-center space-y-1">
              <span className="text-2xl font-black text-text-main">{metrics.totalCount}</span>
              <p className="text-[10px] uppercase font-bold text-text-muted">Total Tracked</p>
            </div>
            <div className="glass-panel p-4 rounded-lg border border-primary/30 text-center space-y-1">
              <span className="text-2xl font-black text-primary">{metrics.appliedCount}</span>
              <p className="text-[10px] uppercase font-bold text-primary">Applied</p>
            </div>
            <div className="glass-panel p-4 rounded-lg border border-accent-warning/30 text-center space-y-1">
              <span className="text-2xl font-black text-accent-warning">{metrics.underReviewCount}</span>
              <p className="text-[10px] uppercase font-bold text-accent-warning">Under Review</p>
            </div>
            <div className="glass-panel p-4 rounded-lg border border-secondary/30 text-center space-y-1">
              <span className="text-2xl font-black text-secondary">{metrics.interviewCount}</span>
              <p className="text-[10px] uppercase font-bold text-secondary">Interviews</p>
            </div>
            <div className="glass-panel p-4 rounded-lg border border-accent-success/30 text-center space-y-1">
              <span className="text-2xl font-black text-accent-success">{metrics.offerCount}</span>
              <p className="text-[10px] uppercase font-bold text-accent-success">Offers</p>
            </div>
            <div className="glass-panel p-4 rounded-lg border border-white/10 text-center space-y-1">
              <span className="text-2xl font-black text-text-main">{metrics.offerConversionPercentage}%</span>
              <p className="text-[10px] uppercase font-bold text-text-muted">Offer Rate</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-semibold">
          {["All", "SAVED", "APPLIED", "UNDER_REVIEW", "INTERVIEW_SCHEDULED", "OFFER_RECEIVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white font-bold"
                  : "glass-panel glass-panel-hover text-text-muted hover:text-text-main"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="glass-panel p-12 rounded-lg text-center text-text-subtle text-xs animate-pulse">
            Loading candidate applications...
          </div>
        ) : applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app) => (
              <div key={app._id} className="glass-panel glass-panel-hover p-6 rounded-lg border border-white/10 space-y-4 shadow-luxury">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{app.portalCategory}</span>
                    <h3 className="text-base font-bold text-text-main">{app.jobTitle}</h3>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-text-subtle" />
                      <span>{app.company}</span>
                    </p>
                  </div>

                  {/* Quick Status Dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className={`px-3 py-1 rounded text-xs font-bold border cursor-pointer ${STATUS_COLORS[app.status]}`}
                  >
                    <option value="SAVED" className="bg-surface-1 text-text-main">SAVED</option>
                    <option value="APPLIED" className="bg-surface-1 text-text-main">APPLIED</option>
                    <option value="UNDER_REVIEW" className="bg-surface-1 text-text-main">UNDER REVIEW</option>
                    <option value="INTERVIEW_SCHEDULED" className="bg-surface-1 text-text-main">INTERVIEW</option>
                    <option value="OFFER_RECEIVED" className="bg-surface-1 text-text-main">OFFER</option>
                    <option value="REJECTED" className="bg-surface-1 text-text-main">REJECTED</option>
                  </select>
                </div>

                {app.notes && (
                  <p className="text-xs text-text-muted bg-surface-1/60 p-3 rounded border border-white/5 italic">
                    "{app.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-text-subtle">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-subtle" />
                    <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.applicationUrl && (
                      <a href={app.applicationUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(app._id)} className="text-accent-danger hover:opacity-80 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-lg text-center text-text-subtle text-xs space-y-3">
            <Briefcase className="w-12 h-12 text-text-subtle mx-auto opacity-50" />
            <p className="font-semibold text-text-main">No Applications Found in {activeTab}</p>
            <p>Click "Log Application" above to record job applications and track status progression.</p>
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <div className="glass-panel p-6 rounded-lg border border-white/10 max-w-md w-full space-y-4 shadow-luxury">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-text-main">Log Job Application</h3>
                <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-main text-xs font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Fullstack AI Engineer"
                    className="w-full px-3 py-2 rounded bg-surface-1 border border-white/10 text-text-main focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Google / Staff Selection Commission"
                    className="w-full px-3 py-2 rounded bg-surface-1 border border-white/10 text-text-main focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded bg-surface-1 border border-white/10 text-text-main focus:border-primary"
                    >
                      <option value="SAVED">SAVED</option>
                      <option value="APPLIED">APPLIED</option>
                      <option value="UNDER_REVIEW">UNDER REVIEW</option>
                      <option value="INTERVIEW_SCHEDULED">INTERVIEW</option>
                      <option value="OFFER_RECEIVED">OFFER</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Portal Category</label>
                    <select
                      value={formData.portalCategory}
                      onChange={(e) => setFormData({ ...formData, portalCategory: e.target.value as any })}
                      className="w-full px-3 py-2 rounded bg-surface-1 border border-white/10 text-text-main focus:border-primary"
                    >
                      <option value="Corporate">Corporate</option>
                      <option value="Government">Government</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Application Portal Link</label>
                  <input
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded bg-surface-1 border border-white/10 text-text-main focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Notes / Follow-up Details</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Interview schedule notes, salary target, or contact info..."
                    className="w-full p-3 rounded bg-surface-1 border border-white/10 text-text-main focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded glass-panel text-text-muted">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-glow px-5 py-2 rounded text-white font-bold disabled:opacity-50">
                    {submitting ? "Saving..." : "Save Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
