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

const CATEGORIES = ["All", "Government", "Tech MNCs", "Remote"];

export default function JobsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const [jobs, setJobs] = useState<CanonicalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CanonicalJob | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [activeCategory]);

  async function fetchJobs() {
    setLoading(true);
    try {
      let url = `/api/v1/jobs?sourceCategory=${activeCategory}`;
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
    try {
      const res = await fetch("/api/v1/jobs/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchJobs();
      }
    } catch (err) {
      console.error("Failed to sync job sources:", err);
    } finally {
      setSyncing(false);
    }
  };

  const formatSalary = (min?: number, max?: number, curr = "INR") => {
    if (!min && !max) return "Not Disclosed";
    if (min && max) {
      if (curr === "INR") {
        return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L / yr`;
      }
      return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    return min ? `From ₹${(min / 100000).toFixed(1)}L / yr` : `Up to ₹${(max! / 100000).toFixed(1)}L / yr`;
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
            <span>Multi-Source Job Discovery</span>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-md bg-surface-1 hover:bg-surface-2 border border-white/10 text-xs font-semibold text-text-main flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Syncing Feeds..." : "Sync Latest Jobs"}</span>
        </button>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="glass-panel p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row items-center gap-3 shadow-luxury">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title, company, or skills (e.g. React, ASO, TypeScript)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <MapPin className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Location (e.g. Delhi, Remote)"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="btn-glow px-6 py-2.5 rounded-md text-white font-semibold text-sm shadow-luxury w-full sm:w-auto"
          >
            Search
          </button>
        </form>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                activeCategory === cat ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Jobs List Grid */}
        {loading ? (
          <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
            <span>Scanning Multi-Source Job Feeds...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10 space-y-3">
            <Briefcase className="w-12 h-12 text-text-subtle mx-auto" />
            <p className="font-semibold text-text-main">No jobs found matching your criteria</p>
            <p className="text-xs text-text-subtle">Try clearing filters or click 'Sync Latest Jobs' to pull fresh notifications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="glass-panel glass-panel-hover p-6 rounded-lg border border-white/10 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Badge Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/30 text-primary">
                        {job.employmentType}
                      </span>
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-accent-success/10 border border-accent-success/30 text-accent-success flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{job.trustBadge}</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-text-subtle font-mono">{job.source}</span>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-base font-bold text-text-main group-hover:text-primary transition-colors">{job.title}</h3>
                    <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>{job.company}</span>
                      <span className="text-text-subtle">•</span>
                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                      <span>{job.location}</span>
                    </p>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs text-text-subtle line-clamp-2">{job.description}</p>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-surface-1 border border-white/10 text-[11px] text-text-muted">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                  <div>
                    <span className="text-[10px] uppercase text-text-subtle block">Salary Range</span>
                    <span className="text-xs font-bold text-accent-success">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3.5 py-1.5 rounded-md glass-panel glass-panel-hover text-xs font-semibold text-text-main border border-white/10"
                    >
                      View Details
                    </button>

                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-glow px-3.5 py-1.5 rounded-md text-xs font-semibold text-white flex items-center gap-1"
                    >
                      <span>Apply Official</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-lg border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-6 relative shadow-luxury">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-success/10 border border-accent-success/30 text-accent-success">
                  {selectedJob.trustBadge} ({selectedJob.trustScore}% Trust Score)
                </span>
                <h2 className="text-lg font-bold text-text-main">{selectedJob.title}</h2>
                <p className="text-xs font-semibold text-text-muted">{selectedJob.company} • {selectedJob.location}</p>
              </div>

              <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-white/10 text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-bold text-text-main uppercase text-[11px]">Job Description</h4>
                <p className="text-text-muted leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-text-main uppercase text-[11px]">Key Requirements</h4>
                  <ul className="list-disc list-inside text-text-muted space-y-1">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="font-bold text-text-main uppercase text-[11px]">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-surface-1 border border-white/10 text-text-main">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-text-subtle">Source: <strong className="text-text-main">{selectedJob.source}</strong></span>

              <a
                href={selectedJob.applicationUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-glow px-6 py-2.5 rounded-md text-xs font-bold text-white flex items-center gap-2"
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
