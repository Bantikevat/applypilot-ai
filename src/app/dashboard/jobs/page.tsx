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
}

const CATEGORIES = ["All", "Government", "Tech MNCs", "Remote", "WhatsApp / Telegram"];

export default function JobsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const [jobs, setJobs] = useState<CanonicalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [selectedJob, setSelectedJob] = useState<CanonicalJob | null>(null);

  // Social Ingestion Modal State
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [socialSource, setSocialSource] = useState<"TELEGRAM" | "WHATSAPP">("TELEGRAM");
  const [groupName, setGroupName] = useState("MERN stack Developers");
  const [rawText, setRawText] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState("");

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

  const handleSocialIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setIngesting(true);
    setIngestSuccess("");
    try {
      const endpoint = socialSource === "TELEGRAM" ? "/api/v1/jobs/telegram-webhook" : "/api/v1/jobs/whatsapp-webhook";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageText: rawText,
          groupName: groupName || (socialSource === "TELEGRAM" ? "Telegram Job Channel" : "WhatsApp Job Group"),
          senderName: "Banti Direct Paste",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIngestSuccess(`SUCCESS! Job extracted from ${socialSource} post and saved to Live Database!`);
        setRawText("");
        fetchJobs();
        setTimeout(() => {
          setIngestSuccess("");
          setPasteModalOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Social job paste ingestion failed:", err);
    } finally {
      setIngesting(false);
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
            <span>Live Job Discovery Pipeline</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPasteModalOpen(true)}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-luxury flex items-center gap-2 cursor-pointer transition-all"
          >
            <ClipboardPaste className="w-4 h-4 text-yellow-300 animate-bounce" />
            <span>Paste Telegram / WhatsApp Job Post</span>
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

        {/* WhatsApp & Telegram Live Job Ingestion Banner */}
        <div className="glass-panel p-6 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-surface-1 to-teal-950/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-luxury">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Telegram Groups & WhatsApp Channel Real-Time Ingestion Active</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Telegram & WhatsApp Job Ingester: <span className="text-emerald-400">Copy-Paste or Auto-Sync</span>
            </h2>
            <p className="text-xs text-text-muted max-w-3xl">
              Found a job post in **MERN stack Developers**, **KickCharm**, **MentorSetu**, or WhatsApp? Click **"Paste Telegram / WhatsApp Job Post"** above or view synced social jobs below!
            </p>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex-shrink-0">
            <button
              onClick={() => setPasteModalOpen(true)}
              className="p-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <Send className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <span className="text-xs font-bold block">Telegram Posts</span>
                <span className="text-[10px] font-mono text-cyan-300 block">+ Paste & Parse Job</span>
              </div>
            </button>

            <button
              onClick={() => setPasteModalOpen(true)}
              className="p-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <span className="text-xs font-bold block">WhatsApp Groups</span>
                <span className="text-[10px] font-mono text-emerald-300 block">+ Paste & Parse Job</span>
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
                placeholder="Search job title, skills, or company (e.g. MERN, TCS NQT, Fullstack AI, Next.js)..."
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
            <p className="text-xs text-text-subtle">Click "Paste Telegram / WhatsApp Job Post" above or click "Multi-Source Sync" to fetch live notices.</p>
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
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-3 py-1.5 rounded-md glass-panel glass-panel-hover text-xs font-semibold text-text-main border border-white/10 cursor-pointer"
                  >
                    View Details
                  </button>

                  <a
                    href={job.applicationUrl || job.sourceUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-glow px-4 py-1.5 rounded-md text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-luxury"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Paste Social Job Post Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-xl border border-primary/40 w-full max-w-lg space-y-6 relative shadow-luxury">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-base font-bold text-text-main">
                <ClipboardPaste className="w-5 h-5 text-primary" />
                <span>Parse Job Post from Telegram or WhatsApp</span>
              </div>
              <button onClick={() => setPasteModalOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-text-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {ingestSuccess && (
              <div className="p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{ingestSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSocialIngestSubmit} className="space-y-4">
              {/* Source Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Select Platform Source</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSocialSource("TELEGRAM")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      socialSource === "TELEGRAM" ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-surface-1 border-white/10 text-text-muted"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram Channel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialSource("WHATSAPP")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      socialSource === "WHATSAPP" ? "bg-emerald-500/20 border-emerald-400 text-emerald-300" : "bg-surface-1 border-white/10 text-text-muted"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Group</span>
                  </button>
                </div>
              </div>

              {/* Group / Channel Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Group / Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g. MERN stack Developers, KickCharm, MentorSetu"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-1 border border-white/10 text-xs text-text-main font-semibold focus:border-primary focus:outline-none"
                />
              </div>

              {/* Message Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Paste Message Text from Telegram / WhatsApp</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste raw message text here... (e.g. Urgent Hiring: Senior MERN Developer at TechFlow Solutions. Location: Remote / Bhopal. Salary: 15 LPA. Apply at https://...)"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-1 border border-white/10 text-xs text-text-main font-mono focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={ingesting}
                className="btn-glow w-full py-3 rounded-lg font-bold text-xs text-white shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className={`w-4 h-4 ${ingesting ? "animate-spin" : ""}`} />
                <span>{ingesting ? "AI Extracting Job Details..." : "AI RegEx Parse & Save to Dashboard"}</span>
              </button>
            </form>
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
              <a
                href={selectedJob.applicationUrl || selectedJob.sourceUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="btn-glow px-6 py-2.5 rounded-md text-white text-xs font-bold flex items-center gap-1.5 shadow-luxury cursor-pointer"
              >
                <span>Proceed to Official Application Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
