import { connectToDatabase } from "@/lib/db/mongoose";
import { CanonicalJob, ICanonicalJobDocument } from "../models/CanonicalJob";
import { CanonicalJobInput, JobSearchQuery } from "../schemas/jobSchemas";
import {
  GovernmentSourceAdapter,
  CompanyCareerAdapter,
  JobBoardAdapter,
  SpecializedRemoteJobAdapter,
  JobSourceAdapter,
} from "../adapters/sourceAdapters";
import { SocialJobIngestionService } from "./socialJobIngestionService";
import { NotFoundError } from "@/lib/errors/AppError";

export interface MemoryJob extends CanonicalJobInput {
  _id: string;
  deduplicationHash: string;
  trustScore: number;
  trustBadge: "Verified Official Source" | "High Confidence" | "Needs Verification" | "Suspicious / Application Fee Warning";
  status: "ACTIVE" | "EXPIRED" | "SUSPICIOUS";
  collectedAt: Date;
  lastVerifiedAt: Date;
}

// Global In-Memory Cache for dev performance
const memoryJobs: Map<string, MemoryJob> = new Map();

export class JobDiscoveryService {
  /**
   * Computes deduplication hash based on company, title, and location
   */
  private static computeDeduplicationHash(company: string, title: string, location: string): string {
    const raw = `${company.toLowerCase().trim()}_${title.toLowerCase().trim()}_${location.toLowerCase().trim()}`;
    return raw.replace(/[^a-z0-9_]/g, "");
  }

  /**
   * Evaluates trust score and badge for ingested jobs
   */
  private static calculateTrustScore(input: CanonicalJobInput): { trustScore: number; trustBadge: "Verified Official Source" | "High Confidence" | "Needs Verification" | "Suspicious / Application Fee Warning" } {
    let score = 70; // Base score

    if (input.source.includes("gov") || input.source.includes("upsc") || input.source.includes("ssc")) {
      score += 25;
    }

    if (input.applicationUrl && (input.applicationUrl.includes("gov.in") || input.applicationUrl.includes("careers.google.com"))) {
      score += 10;
    }

    if (input.source.includes("WhatsApp") || input.source.includes("Telegram")) {
      score = 85; // High confidence social group ingestion
    }

    let badge: "Verified Official Source" | "High Confidence" | "Needs Verification" | "Suspicious / Application Fee Warning" = "Needs Verification";

    if (score >= 90) {
      badge = "Verified Official Source";
    } else if (score >= 70) {
      badge = "High Confidence";
    }

    return { trustScore: score, trustBadge: badge };
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

        const memJob: MemoryJob = {
          _id: (newJob._id || newJob.id).toString(),
          ...input,
          deduplicationHash,
          trustScore,
          trustBadge,
          status: trustScore < 30 ? "SUSPICIOUS" : "ACTIVE",
          postedAt: input.postedAt ? new Date(input.postedAt) : null,
          collectedAt: new Date(),
          lastVerifiedAt: new Date(),
        };
        memoryJobs.set(memJob._id, memJob);

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
   * Alias for social job ingestion compatibility
   */
  static async ingestCanonicalJob(input: CanonicalJobInput) {
    return this.ingestJob(input);
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

    // Sync WhatsApp & Telegram Social Feeds
    try {
      const socialJobs = await SocialJobIngestionService.syncSampleSocialFeeds();
      count += socialJobs.length;
    } catch (err) {
      console.warn("Social feed sync warning:", err);
    }

    return { totalIngested: count };
  }

  /**
   * Searches canonical jobs with category, location, and query filters
   */
  static async searchJobs(query: JobSearchQuery): Promise<{ jobs: Array<Partial<ICanonicalJobDocument | MemoryJob>>; total: number }> {
    if (memoryJobs.size === 0) {
      await this.syncAllSources();
    }

    const cat = (query.sourceCategory || "").toLowerCase().trim();

    const db = await connectToDatabase();
    if (db) {
      try {
        const filter: Record<string, unknown> = {};

        if (cat === "government") {
          filter.employmentType = "Government";
        } else if (cat === "tech mncs") {
          filter.source = { $regex: "Google|DeepMind|Tech", $options: "i" };
        } else if (cat === "remote") {
          filter.employmentType = "Remote";
        } else if (cat.includes("whatsapp") || cat.includes("telegram") || cat.includes("social")) {
          filter.$or = [
            { sourceCategory: { $regex: "WhatsApp|Telegram", $options: "i" } },
            { source: { $regex: "WhatsApp|Telegram", $options: "i" } },
            { sourceAdapter: { $regex: "WhatsApp|Telegram", $options: "i" } },
            { company: { $regex: "WhatsApp|Telegram", $options: "i" } },
          ];
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

        if (jobs && jobs.length > 0) {
          return { jobs, total };
        }
      } catch (err) {
        console.warn("MongoDB query warning:", err);
      }
    }

    // In-Memory Dev Store fallback search
    let items = Array.from(memoryJobs.values());

    if (cat === "government") {
      items = items.filter((j) => j.employmentType === "Government");
    } else if (cat === "tech mncs") {
      items = items.filter((j) => /google|deepmind|tech/i.test(j.source));
    } else if (cat === "remote") {
      items = items.filter((j) => j.employmentType === "Remote");
    } else if (cat.includes("whatsapp") || cat.includes("telegram") || cat.includes("social")) {
      items = items.filter(
        (j) =>
          /whatsapp|telegram/i.test(j.source || "") ||
          /whatsapp|telegram/i.test(j.sourceCategory || "") ||
          /whatsapp|telegram/i.test(j.company || "") ||
          (j.sourceAdapter && /whatsapp|telegram/i.test(j.sourceAdapter))
      );
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
    if (memoryJobs.size === 0) {
      await this.syncAllSources();
    }

    const db = await connectToDatabase();
    if (db) {
      try {
        const job = await CanonicalJob.findById(jobId);
        if (job) return job;
      } catch {
        // Fallback
      }
    }

    const memJob = memoryJobs.get(jobId);
    if (memJob) return memJob;

    for (const j of memoryJobs.values()) {
      if (j._id === jobId) return j;
    }

    throw new NotFoundError("Canonical job record not found");
  }
}
