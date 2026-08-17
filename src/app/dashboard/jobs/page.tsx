"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Search,
  Briefcase,
  MapPin,
  ShieldCheck,
  Building2,
  ExternalLink,
  CheckCircle2,
  Filter,
  RefreshCw,
  X,
  Award,
  Clock,
  MessageSquare,
  Send,
  Radio,
  ClipboardPaste,
  PlusCircle,
  ChevronDown,
  Zap,
  FileCheck,
  Check,
  UserCheck,
  ThumbsUp,
} from "lucide-react";

interface CanonicalJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  minExperienceYears: number;
  educationRequirements: string[];
  skills: string[];
  description: string;
  requirements: string[];
  applicationUrl: string;
  source: string;
  sourceUrl?: string;
  trustScore: number;
  trustBadge: "Verified Official Source" | "High Confidence" | "Needs Verification" | "Suspicious / Application Fee Warning";
  postedAt: string;
  rawPayload?: any;
}

const CATEGORIES = ["All", "Naukri.com", "WorkIndia", "Government", "Tech MNCs", "Remote", "WhatsApp / Telegram", "KickCharm Jobs"];

const BANTI_TELEGRAM_PRESETS = [
  "Jobs In India (ISRO | DRDO)",
  "TechUprise - Exclusive Updates",
  "Jobs/Internship All Batches",
  "MERN stack Developers",
  "KickCharm - Job Updates",
  "MentorSetu | Job, internship",
  "Learn Code With Durgesh",
  "Frontend developers (React)",
];

export default function JobsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const [jobs, setJobs] = useState<CanonicalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [selectedJob, setSelectedJob] = useState<CanonicalJob | null>(null);

  // Auto-Apply State & Audit Receipt Modal
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [autoApplyReceipt, setAutoApplyReceipt] = useState<any>(null);

  // Voice Workflow Social Inspection & Approval Modal State
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [socialSource, setSocialSource] = useState<"TELEGRAM" | "WHATSAPP">("TELEGRAM");
  const [groupName, setGroupName] = useState("Jobs In India (ISRO | DRDO)");
  const [rawText, setRawText] = useState("");
  const [inspecting, setInspecting] = useState(false);
  const [draftResult, setDraftResult] = useState<any>(null);
  const [approvalSuccess, setApprovalSuccess] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [activeCategory]);

  async function fetchJobs() {
    setLoading(true);
    try {
      let url = `/api/v1/jobs?sourceCategory=${encodeURIComponent(activeCategory)}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      if (locationQuery) url += `&location=${encodeURIComponent(locationQuery)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        setJobs(data.data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to load job postings:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/v1/jobs/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncMsg("Live Job Feed Ingested! Government, MNC, Remote, WhatsApp & Telegram channels updated.");
        fetchJobs();
        setTimeout(() => setSyncMsg(""), 4000);
      }
    } catch (err) {
      console.error("Failed to sync job sources:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleAutoApply = async (job: CanonicalJob) => {
    setApplyingJobId(job._id);
    setAutoApplyReceipt(null);
    try {
      const res = await fetch("/api/v1/applications/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job._id,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          applicationUrl: job.applicationUrl || job.sourceUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAutoApplyReceipt({
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          applicationUrl: job.applicationUrl || job.sourceUrl,
          candidate: data.data.candidateProfileUsed,
          timestamp: new Date().toLocaleString(),
          applicationId: data.data.application._id,
        });
      }
    } catch (err) {
      console.error("Auto-apply error:", err);
    } finally {
      setApplyingJobId(null);
    }
  };

  // Step 1-3: AI Inspect Link & Draft Form Payload
  const handleInspectAndDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setInspecting(true);
    setDraftResult(null);
    setApprovalSuccess("");
    try {
      const res = await fetch("/api/v1/assistant/inspect-and-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageText: rawText,
          groupName: groupName || (socialSource === "TELEGRAM" ? "Telegram Job Channel" : "WhatsApp Job Group"),
          source: socialSource,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDraftResult(data.data);
        fetchJobs();
      }
    } catch (err) {
      console.error("Inspect & draft failed:", err);
    } finally {
      setInspecting(false);
    }
  };

  // Step 4-5: Banti Approval & Final Submission
  const handleApproveAndSubmit = async () => {
    if (!draftResult) return;
    setApprovalSuccess("");

    try {
      const res = await fetch("/api/v1/applications/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: draftResult.parsedJob.title,
          company: draftResult.parsedJob.company,
          location: draftResult.parsedJob.location,
          applicationUrl: draftResult.parsedJob.applicationUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApprovalSuccess(`🎉 Approved! Banti Kevat's application for ${draftResult.parsedJob.title} at ${draftResult.parsedJob.company} has been submitted & saved to ATS Tracker!`);
        setTimeout(() => {
          setApprovalSuccess("");
          setDraftResult(null);
          setRawText("");
          setPasteModalOpen(false);
          fetchJobs();
        }, 2500);
      }
    } catch (err) {
      console.error("Approval submit error:", err);
    }
  };

  const formatSalary = (min?: number, max?: number, curr = "INR") => {
    if (!min && !max) return "Competitive Market Package";
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${curr} ${min.toLocaleString()}+`;
    return `${curr} Up to ${max?.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-md glass-panel glass-panel-hover text-text-muted hover:text-text-main">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>AI Social Group Inspector & Auto-Apply Assistant</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/applications"
            className="px-4 py-2 rounded-md glass-panel glass-panel-hover text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Live ATS Tracker</span>
          </Link>

          <button
            onClick={() => {
              setDraftResult(null);
              setPasteModalOpen(true);
            }}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-luxury flex items-center gap-2 cursor-pointer transition-all"
          >
            <ClipboardPaste className="w-4 h-4 text-yellow-300 animate-bounce" />
            <span>Inspect Telegram / WhatsApp Job Post</span>
          </button>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-glow px-4 py-2 rounded-md text-white text-xs font-bold shadow-luxury disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Multi-Source Sync"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Sync Success Notification */}
        {syncMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{syncMsg}</span>
          </div>
        )}

        {/* WhatsApp & Telegram AI Assistant Voice Workflow Banner */}
        <div className="glass-panel p-6 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-surface-1 to-teal-950/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-luxury">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 animate-pulse" />
              <span>Banti's Personal AI Assistant Workflow: Inspect • Eligibility Check • Fill Form Draft • Banti Approval</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Banti's AI Assistant: <span className="text-emerald-400">Telegram & WhatsApp Group Job Inspector</span>
            </h2>
            <p className="text-xs text-text-muted max-w-3xl">
              Paste any job post from your Telegram/WhatsApp groups! The AI will inspect the link, verify your eligibility (M.Tech AI&ML, OBC, MERN experience), prepare the pre-filled form draft, and ask for your approval before final submission!
            </p>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex-shrink-0">
            <button
              onClick={() => {
                setDraftResult(null);
                setPasteModalOpen(true);
              }}
              className="p-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <Send className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <span className="text-xs font-bold block">Telegram Posts</span>
                <span className="text-[10px] font-mono text-cyan-300 block">Inspect & Draft Form</span>
              </div>
            </button>

            <button
              onClick={() => {
                setDraftResult(null);
                setPasteModalOpen(true);
              }}
              className="p-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <span className="text-xs font-bold block">WhatsApp Groups</span>
                <span className="text-[10px] font-mono text-emerald-300 block">Inspect & Draft Form</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-4 shadow-luxury">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search job title, skills, or company (e.g. ISRO, MERN, TCS NQT, Fullstack AI, Next.js)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-surface-1 border border-white/10 text-xs text-text-main focus:outline-none focus:border-primary font-semibold"
              />
            </div>

            <div className="relative w-full sm:w-64">
              <MapPin className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Location (e.g. Remote, Ujjain, Bhopal)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-md bg-surface-1 border border-white/10 text-xs text-text-main focus:outline-none focus:border-primary font-semibold"
              />
            </div>

            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors cursor-pointer">
              Search Jobs
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
            <span>Searching 4-Category Job Ingestion Pipeline...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10 space-y-3">
            <Briefcase className="w-12 h-12 text-text-subtle mx-auto" />
            <p className="font-semibold text-text-main">No job postings found for current search filters</p>
            <p className="text-xs text-text-subtle">Click "Inspect Telegram / WhatsApp Job Post" above or click "Multi-Source Sync" to fetch live notices.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="glass-panel glass-panel-hover p-6 rounded-lg border border-white/10 space-y-4 flex flex-col justify-between shadow-luxury relative"
              >
                <div className="space-y-3">
                  {/* Top Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{job.trustBadge}</span>
                    </span>

                    <span className="text-[10px] font-mono text-text-subtle">{job.employmentType}</span>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-base font-extrabold text-text-main hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                    <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>{job.company}</span>
                    </p>
                  </div>

                  {/* Location & Salary */}
                  <div className="space-y-1 text-xs text-text-muted border-t border-b border-white/5 py-3 my-2">
                    <p className="flex items-center gap-1.5 text-text-subtle">
                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                      <span>{job.location}</span>
                    </p>
                    <p className="font-semibold text-emerald-400">
                      💰 {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </p>
                  </div>

                  {/* Skills Tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-1 border border-white/10 text-text-muted">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => handleAutoApply(job)}
                    disabled={applyingJobId === job._id}
                    className="w-full py-2 px-3 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-luxury flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <Zap className={`w-3.5 h-3.5 text-yellow-300 ${applyingJobId === job._id ? "animate-spin" : ""}`} />
                    <span>{applyingJobId === job._id ? "AI Submitting Application..." : "⚡ 1-Click AI Auto-Apply"}</span>
                  </button>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="w-1/2 py-1.5 rounded-md glass-panel glass-panel-hover text-xs font-semibold text-text-main border border-white/10 cursor-pointer text-center"
                    >
                      View Details
                    </button>

                    <a
                      href={job.applicationUrl || job.sourceUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="w-1/2 py-1.5 rounded-md glass-panel glass-panel-hover text-xs font-bold text-cyan-400 border border-cyan-500/30 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Direct Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Auto-Apply Audit Receipt Proof Modal */}
      {autoApplyReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-xl border border-emerald-500/50 w-full max-w-md space-y-6 relative shadow-luxury">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-base font-extrabold text-emerald-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>Application Submitted Successfully!</span>
              </div>
              <button onClick={() => setAutoApplyReceipt(null)} className="p-1.5 rounded-full hover:bg-white/10 text-text-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-background/90 border border-white/10 space-y-3 text-xs font-mono text-text-muted">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-primary font-bold">Applied Job:</span>
                <span className="text-white font-bold">{autoApplyReceipt.jobTitle}</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-primary font-bold">Company / Org:</span>
                <span className="text-white">{autoApplyReceipt.company}</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-primary font-bold">Candidate Profile Used:</span>
                <span className="text-yellow-300 font-bold">{autoApplyReceipt.candidate.fullName}</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-primary font-bold">Date of Birth Filed:</span>
                <span className="text-white">{autoApplyReceipt.candidate.dateOfBirth}</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-primary font-bold">Qualification Submitted:</span>
                <span className="text-emerald-400">{autoApplyReceipt.candidate.education}</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-primary font-bold">Category Filed:</span>
                <span className="text-white">{autoApplyReceipt.candidate.category}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-primary font-bold">Application Status:</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">APPLIED</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/dashboard/applications"
                className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-luxury flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>View Application in ATS Tracker (/dashboard/applications)</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Voice Workflow Social Inspection & Banti Approval Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-xl border border-primary/40 w-full max-w-xl space-y-6 relative shadow-luxury">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-base font-bold text-text-main">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>Banti's Social Group Inspector & Form Auto-Filler</span>
              </div>
              <button onClick={() => setPasteModalOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-text-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Approval Success Alert */}
            {approvalSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-pulse">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <span>{approvalSuccess}</span>
              </div>
            )}

            {/* Step 3 & 4: AI Inspection Result & Pre-Filled Form Draft for Banti Approval */}
            {draftResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-1 border border-primary/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-extrabold text-primary uppercase">1. Job Details Extracted</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      {draftResult.eligibility.matchScore}% Match Score ({draftResult.eligibility.verdict})
                    </span>
                  </div>

                  <div className="text-xs space-y-1 font-mono text-text-muted">
                    <p><strong className="text-white">Role:</strong> {draftResult.parsedJob.title}</p>
                    <p><strong className="text-white">Company:</strong> {draftResult.parsedJob.company}</p>
                    <p><strong className="text-white">Location:</strong> {draftResult.parsedJob.location}</p>
                    <p className="truncate"><strong className="text-white">Apply Link:</strong> <a href={draftResult.parsedJob.applicationUrl} target="_blank" className="text-cyan-400 underline">{draftResult.parsedJob.applicationUrl}</a></p>
                  </div>
                </div>

                {/* Pre-Filled Form Payload */}
                <div className="p-4 rounded-xl bg-background/90 border border-emerald-500/30 space-y-3">
                  <span className="text-xs font-extrabold text-emerald-400 uppercase block border-b border-white/10 pb-2">
                    2. AI Pre-Filled Candidate Form Payload (Banti Kevat)
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-text-muted">
                    <div className="p-2 rounded bg-surface-1 border border-white/5">
                      <span className="text-[10px] text-text-subtle block">Full Name</span>
                      <span className="text-white font-bold">{draftResult.draftFormFields.fullName}</span>
                    </div>

                    <div className="p-2 rounded bg-surface-1 border border-white/5">
                      <span className="text-[10px] text-text-subtle block">Date of Birth</span>
                      <span className="text-white font-bold">{draftResult.draftFormFields.dateOfBirth}</span>
                    </div>

                    <div className="p-2 rounded bg-surface-1 border border-white/5">
                      <span className="text-[10px] text-text-subtle block">Qualification</span>
                      <span className="text-emerald-400 font-bold">{draftResult.draftFormFields.education}</span>
                    </div>

                    <div className="p-2 rounded bg-surface-1 border border-white/5">
                      <span className="text-[10px] text-text-subtle block">Category</span>
                      <span className="text-white font-bold">{draftResult.draftFormFields.category}</span>
                    </div>

                    <div className="p-2 rounded bg-surface-1 border border-white/5 col-span-2">
                      <span className="text-[10px] text-text-subtle block">Email & Phone</span>
                      <span className="text-white">{draftResult.draftFormFields.email} | {draftResult.draftFormFields.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Banti Approval Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setDraftResult(null)}
                    className="w-1/3 py-3 rounded-lg glass-panel hover:bg-white/10 text-text-muted font-bold text-xs cursor-pointer"
                  >
                    ← Edit Post
                  </button>

                  <button
                    onClick={handleApproveAndSubmit}
                    className="w-2/3 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-luxury flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ThumbsUp className="w-4 h-4 text-yellow-300" />
                    <span>✅ Approve & Auto-Submit Application</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInspectAndDraftSubmit} className="space-y-4">
                {/* Source Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Select Platform Source</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSocialSource("TELEGRAM");
                        setGroupName(BANTI_TELEGRAM_PRESETS[0]);
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        socialSource === "TELEGRAM" ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-surface-1 border-white/10 text-text-muted"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>Telegram Channel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSocialSource("WHATSAPP");
                        setGroupName("MERN Stack Job Hiring India 🇮🇳");
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        socialSource === "WHATSAPP" ? "bg-emerald-500/20 border-emerald-400 text-emerald-300" : "bg-surface-1 border-white/10 text-text-muted"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Group</span>
                    </button>
                  </div>
                </div>

                {/* Group / Channel Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Select or Enter Channel Name</label>
                  {socialSource === "TELEGRAM" ? (
                    <select
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-1 border border-white/10 text-xs text-text-main font-semibold focus:border-primary focus:outline-none"
                    >
                      {BANTI_TELEGRAM_PRESETS.map((preset) => (
                        <option key={preset} value={preset} className="bg-background text-text-main">
                          {preset}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. MERN Stack Jobs India, Ujjain & Bhopal Opportunities"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-1 border border-white/10 text-xs text-text-main font-semibold focus:border-primary focus:outline-none"
                    />
                  )}
                </div>

                {/* Message Text Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Paste Message Text from Telegram / WhatsApp</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Paste raw message text here... (e.g. TCS NQT 2026 Registration is Live! Senior MERN Stack Developer at Remote...)"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-1 border border-white/10 text-xs text-text-main font-mono focus:border-primary focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={inspecting}
                  className="btn-glow w-full py-3 rounded-lg font-bold text-xs text-white shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${inspecting ? "animate-spin" : ""}`} />
                  <span>{inspecting ? "AI Inspecting Link & Preparing Form Draft..." : "AI Inspect Link & Prepare Pre-filled Form Draft"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-lg border border-white/10 w-full max-w-2xl max-h-[85vh] flex flex-col space-y-4 relative shadow-luxury">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-text-main">{selectedJob.title}</h3>
                <p className="text-xs text-text-muted">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-white/10 text-text-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-md bg-surface-1/90 p-4 border border-white/5 space-y-4 text-xs text-text-muted">
              <div>
                <h4 className="font-bold text-text-main mb-1">Job Description & Notice Details:</h4>
                <p className="whitespace-pre-line leading-relaxed">{selectedJob.description}</p>
              </div>

              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-text-main mb-1">Required Skills:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-surface-1 border border-white/10 text-text-main font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold">{selectedJob.trustBadge}</span>
              <button
                onClick={() => {
                  setSelectedJob(null);
                  handleAutoApply(selectedJob);
                }}
                className="btn-glow px-6 py-2.5 rounded-md text-white text-xs font-extrabold flex items-center gap-1.5 shadow-luxury cursor-pointer"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>⚡ 1-Click AI Auto-Apply Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
