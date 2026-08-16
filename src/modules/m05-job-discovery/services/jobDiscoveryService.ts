import crypto from "crypto";
import { CanonicalJob, ICanonicalJobDocument } from "../models/CanonicalJob";
import { CanonicalJobInput, JobSearchQuery } from "../schemas/jobSchemas";
import { GovernmentSourceAdapter, CompanyCareerAdapter, JobBoardAdapter, SpecializedRemoteJobAdapter, JobSourceAdapter } from "../adapters/sourceAdapters";
import { connectToDatabase } from "@/lib/db/mongoose";
import { NotFoundError } from "@/lib/errors/AppError";

export interface MemoryJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Government" | "Remote";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  minExperienceYears: number;
  maxExperienceYears?: number;
  educationRequirements: string[];
  skills: string[];
  description: string;
  requirements: string[];
  applicationUrl: string;
  source: string;
  sourceUrl?: string;
  deduplicationHash: string;
  trustScore: number;
  trustBadge: "Verified Official Source" | "High Confidence" | "Needs Verification" | "Suspicious / Application Fee Warning";
  status: "ACTIVE" | "EXPIRED" | "SUSPICIOUS";
  postedAt: Date | null;
  collectedAt: Date;
  lastVerifiedAt: Date;
}

const memoryJobs = new Map<string, MemoryJob>();

export class JobDiscoveryService {
  /**
   * Computes deterministic SHA-256 fingerprint for deduplication
   */
  static computeDeduplicationHash(company: string, title: string, location: string): string {
    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLocation = location.toLowerCase().replace(/[^a-z0-9]/g, "");
    const raw = `${cleanCompany}:${cleanTitle}:${cleanLocation}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  /**
   * Calculates Job Quality & Trust Score (0-100%) and assigns Trust Badge
   */
  static calculateTrustScore(input: CanonicalJobInput): { trustScore: number; trustBadge: MemoryJob["trustBadge"] } {
    let score = 70;

    // Official Government & Verified Company bonus
    if (input.source.toLowerCase().includes("ssc") || input.source.toLowerCase().includes("upsc") || input.source.toLowerCase().includes("official")) {
      score += 25;
    } else if (input.source.toLowerCase().includes("careers") || input.source.toLowerCase().includes("google") || input.source.toLowerCase().includes("deepmind")) {
      score += 20;
    }

    // Detailed requirements & description bonus
    if (input.description.length > 100) score += 5;
    if (input.skills.length >= 3) score += 5;

    // Check for suspicious signals
    const suspiciousKeywords = ["application fee mandatory via gpay", "pay 500 rs registration fee", "part time telegram job"];
    for (const kw of suspiciousKeywords) {
      if (input.description.toLowerCase().includes(kw)) {
        return { trustScore: 10, trustBadge: "Suspicious / Application Fee Warning" };
      }
    }

    const finalScore = Math.min(100, Math.max(0, score));

    let badge: MemoryJob["trustBadge"] = "Needs Verification";
    if (finalScore >= 90) {
      badge = "Verified Official Source";
    } else if (finalScore >= 75) {
      badge = "High Confidence";
    }

    return { trustScore: finalScore, trustBadge: badge };
  }

  /**
   * Ingests, normalizes, deduplicates, and stores a raw job posting
   */
  static async ingestJob(input: CanonicalJobInput): Promise<Partial<ICanonicalJobDocument | MemoryJob>> {
    const deduplicationHash = this.computeDeduplicationHash(input.company, input.title, input.location);
    const { trustScore, trustBadge } = this.calculateTrustScore(input);

    const db = await connectToDatabase();

    if (db) {
      try {
        const existing = await CanonicalJob.findOne({ deduplicationHash });
        if (existing) {
          existing.lastVerifiedAt = new Date();
          await existing.save();
          return existing;
        }

        const newJob = await CanonicalJob.create({
          ...input,
          deduplicationHash,
          trustScore,
          trustBadge,
          status: trustScore < 30 ? "SUSPICIOUS" : "ACTIVE",
          postedAt: input.postedAt ? new Date(input.postedAt) : null,
          collectedAt: new Date(),
          lastVerifiedAt: new Date(),
        });

        return newJob;
      } catch (err) {
        console.warn("MongoDB offline, saving Job in Memory Store:", err);
      }
    }

    // In-Memory Dev Store fallback
    let existingMem: MemoryJob | undefined;
    for (const j of memoryJobs.values()) {
      if (j.deduplicationHash === deduplicationHash) {
        existingMem = j;
        break;
      }
    }

    if (existingMem) {
      existingMem.lastVerifiedAt = new Date();
      return existingMem;
    }

    const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const memJob: MemoryJob = {
      _id: jobId,
      ...input,
      deduplicationHash,
      trustScore,
      trustBadge,
      status: trustScore < 30 ? "SUSPICIOUS" : "ACTIVE",
      postedAt: input.postedAt ? new Date(input.postedAt) : null,
      collectedAt: new Date(),
      lastVerifiedAt: new Date(),
    };

    memoryJobs.set(jobId, memJob);
    return memJob;
  }

  /**
   * Triggers multi-source sync run across all registered source adapters
   */
  static async syncAllSources(): Promise<{ totalIngested: number }> {
    const adapters: JobSourceAdapter[] = [
      new GovernmentSourceAdapter(),
      new CompanyCareerAdapter(),
      new JobBoardAdapter(),
      new SpecializedRemoteJobAdapter(),
    ];

    let count = 0;
    for (const adapter of adapters) {
      const rawJobs = await adapter.fetchJobs();
      for (const jobInput of rawJobs) {
        await this.ingestJob(jobInput);
        count++;
      }
    }

    return { totalIngested: count };
  }

  /**
   * Searches canonical jobs with category, location, and query filters
   */
  static async searchJobs(query: JobSearchQuery): Promise<{ jobs: Array<Partial<ICanonicalJobDocument | MemoryJob>>; total: number }> {
    // Ensure initial sync has run
    if (memoryJobs.size === 0) {
      await this.syncAllSources();
    }

    const db = await connectToDatabase();
    if (db) {
      try {
        const filter: Record<string, unknown> = {};
        if (query.sourceCategory === "Government") {
          filter.employmentType = "Government";
        } else if (query.sourceCategory === "Tech MNCs") {
          filter.source = { $regex: "Google|DeepMind|Tech", $options: "i" };
        } else if (query.sourceCategory === "Remote") {
          filter.employmentType = "Remote";
        }

        if (query.q) {
          filter.$or = [
            { title: { $regex: query.q, $options: "i" } },
            { company: { $regex: query.q, $options: "i" } },
            { description: { $regex: query.q, $options: "i" } },
          ];
        }

        const total = await CanonicalJob.countDocuments(filter);
        const jobs = await CanonicalJob.find(filter)
          .sort({ createdAt: -1 })
          .skip((query.page - 1) * query.limit)
          .limit(query.limit);

        return { jobs, total };
      } catch (err) {
        console.warn("MongoDB offline, searching Memory Store:", err);
      }
    }

    // In-Memory Dev Store fallback search
    let items = Array.from(memoryJobs.values());

    if (query.sourceCategory === "Government") {
      items = items.filter((j) => j.employmentType === "Government");
    } else if (query.sourceCategory === "Tech MNCs") {
      items = items.filter((j) => /google|deepmind|tech/i.test(j.source));
    } else if (query.sourceCategory === "Remote") {
      items = items.filter((j) => j.employmentType === "Remote");
    }

    if (query.q) {
      const qLower = query.q.toLowerCase();
      items = items.filter(
        (j) =>
          j.title.toLowerCase().includes(qLower) ||
          j.company.toLowerCase().includes(qLower) ||
          j.description.toLowerCase().includes(qLower)
      );
    }

    const total = items.length;
    const startIndex = (query.page - 1) * query.limit;
    const paginated = items.slice(startIndex, startIndex + query.limit);

    return { jobs: paginated, total };
  }

  /**
   * Retrieves single canonical job by ID
   */
  static async getJobById(jobId: string): Promise<Partial<ICanonicalJobDocument | MemoryJob>> {
    // Ensure initial sync
    if (memoryJobs.size === 0) {
      await this.syncAllSources();
    }

    const db = await connectToDatabase();
    if (db) {
      try {
        const job = await CanonicalJob.findById(jobId);
        if (job) return job;
      } catch {
        // Fallback to memory
      }
    }

    const memJob = memoryJobs.get(jobId);
    if (memJob) return memJob;

    // Default search by id string matching
    for (const j of memoryJobs.values()) {
      if (j._id === jobId) return j;
    }

    throw new NotFoundError("Canonical job record not found");
  }
}
