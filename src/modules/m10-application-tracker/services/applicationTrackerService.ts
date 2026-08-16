import { ApplicationTracker, IApplicationTrackerDocument } from "../models/ApplicationTracker";
import { CreateApplicationInput, UpdateApplicationInput } from "../schemas/trackerSchemas";
import { connectToDatabase } from "@/lib/db/mongoose";
import { NotFoundError, AuthError, ValidationError } from "@/lib/errors/AppError";

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "OFFER_RECEIVED"
  | "OFFER_ACCEPTED"
  | "OFFER_DECLINED"
  | "REJECTED"
  | "WITHDRAWN"
  | "GHOSTED";

export interface MemoryApplication {
  _id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  applicationUrl?: string;
  status: ApplicationStatus;
  portalCategory: "Government" | "Corporate" | "Remote" | "Other";
  appliedAt: Date;
  deadlineAt?: Date;
  nextFollowUpAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const memoryApplications = new Map<string, MemoryApplication>();

/**
 * State Transition Guard Map for Application Pipeline Lifecycle
 * Enforces valid state transitions and protects terminal states (REJECTED, WITHDRAWN, OFFER_ACCEPTED, OFFER_DECLINED).
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  SAVED: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "OFFER_RECEIVED", "REJECTED", "WITHDRAWN", "GHOSTED"],
  UNDER_REVIEW: ["SHORTLISTED", "INTERVIEW_SCHEDULED", "OFFER_RECEIVED", "REJECTED", "WITHDRAWN", "GHOSTED"],
  SHORTLISTED: ["INTERVIEW_SCHEDULED", "OFFER_RECEIVED", "REJECTED", "WITHDRAWN", "GHOSTED"],
  INTERVIEW_SCHEDULED: ["OFFER_RECEIVED", "REJECTED", "WITHDRAWN", "GHOSTED"],
  OFFER_RECEIVED: ["OFFER_ACCEPTED", "OFFER_DECLINED", "WITHDRAWN"],
  OFFER_ACCEPTED: [], // Terminal state
  OFFER_DECLINED: [], // Terminal state
  REJECTED: [],       // Terminal state — No transitions permitted out of REJECTED
  WITHDRAWN: [],      // Terminal state
  GHOSTED: ["UNDER_REVIEW", "INTERVIEW_SCHEDULED", "REJECTED", "WITHDRAWN"], // Revivable state
};

export interface ATSMetricsSummary {
  totalCount: number;
  savedCount: number;
  appliedCount: number;
  underReviewCount: number;
  interviewCount: number;
  offerCount: number;
  acceptedCount: number;
  rejectedCount: number;
  withdrawnCount: number;
  ghostedCount: number;
  offerConversionPercentage: number;
}

export class ApplicationTrackerService {
  /**
   * Validates state transitions between current and new application status
   */
  static validateStatusTransition(currentStatus: string, newStatus: string): void {
    if (currentStatus === newStatus) return;

    const allowedNext = VALID_TRANSITIONS[currentStatus];
    if (!allowedNext || !allowedNext.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. ${
          allowedNext && allowedNext.length === 0
            ? `'${currentStatus}' is a terminal state and cannot be modified.`
            : `Allowed transitions from '${currentStatus}' are: ${allowedNext?.join(", ") || "None"}.`
        }`
      );
    }
  }

  /**
   * Computes ATS metrics summary for a candidate
   */
  static calculateATSMetrics(apps: Array<Partial<IApplicationTrackerDocument | MemoryApplication>>): ATSMetricsSummary {
    let saved = 0;
    let applied = 0;
    let underReview = 0;
    let interview = 0;
    let offer = 0;
    let accepted = 0;
    let rejected = 0;
    let withdrawn = 0;
    let ghosted = 0;

    for (const a of apps) {
      switch (a.status) {
        case "SAVED": saved++; break;
        case "APPLIED": applied++; break;
        case "UNDER_REVIEW": case "SHORTLISTED": underReview++; break;
        case "INTERVIEW_SCHEDULED": interview++; break;
        case "OFFER_RECEIVED": offer++; break;
        case "OFFER_ACCEPTED": accepted++; offer++; break;
        case "OFFER_DECLINED": offer++; break;
        case "REJECTED": rejected++; break;
        case "WITHDRAWN": withdrawn++; break;
        case "GHOSTED": ghosted++; break;
      }
    }

    const totalActive = applied + underReview + interview + offer + rejected;
    const conversion = totalActive > 0 ? Math.round((offer / totalActive) * 100) : 0;

    return {
      totalCount: apps.length,
      savedCount: saved,
      appliedCount: applied,
      underReviewCount: underReview,
      interviewCount: interview,
      offerCount: offer,
      acceptedCount: accepted,
      rejectedCount: rejected,
      withdrawnCount: withdrawn,
      ghostedCount: ghosted,
      offerConversionPercentage: conversion,
    };
  }

  /**
   * Creates a new candidate application record
   */
  static async createApplication(userId: string, input: CreateApplicationInput): Promise<Partial<IApplicationTrackerDocument | MemoryApplication>> {
    const db = await connectToDatabase();

    const appliedAt = input.appliedAt ? new Date(input.appliedAt) : new Date();
    const deadlineAt = input.deadlineAt ? new Date(input.deadlineAt) : undefined;
    const nextFollowUpAt = input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : undefined;

    if (db) {
      try {
        const app = await ApplicationTracker.create({
          userId,
          jobTitle: input.jobTitle,
          company: input.company,
          applicationUrl: input.applicationUrl || "",
          status: input.status,
          portalCategory: input.portalCategory,
          appliedAt,
          deadlineAt,
          nextFollowUpAt,
          notes: input.notes,
        });

        return app;
      } catch (err) {
        console.warn("MongoDB offline, saving application in Memory ATS Store:", err);
      }
    }

    const appId = `app_${Date.now()}`;
    const memApp: MemoryApplication = {
      _id: appId,
      userId,
      jobTitle: input.jobTitle,
      company: input.company,
      applicationUrl: input.applicationUrl || "",
      status: input.status as ApplicationStatus,
      portalCategory: input.portalCategory,
      appliedAt,
      deadlineAt,
      nextFollowUpAt,
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryApplications.set(appId, memApp);
    return memApp;
  }

  /**
   * Retrieves candidate applications with ATS summary metrics
   */
  static async getUserApplications(userId: string, statusFilter?: string): Promise<{ applications: Array<Partial<IApplicationTrackerDocument | MemoryApplication>>; metrics: ATSMetricsSummary }> {
    const db = await connectToDatabase();

    if (db) {
      try {
        const query: any = { userId };
        if (statusFilter && statusFilter !== "All") {
          query.status = statusFilter;
        }

        const apps = await ApplicationTracker.find(query).sort({ appliedAt: -1 });
        const allUserApps = await ApplicationTracker.find({ userId });
        const metrics = this.calculateATSMetrics(allUserApps);

        return { applications: apps, metrics };
      } catch {
        console.warn("MongoDB offline, reading applications from Memory ATS Store.");
      }
    }

    const results: MemoryApplication[] = [];
    const allUserMemApps: MemoryApplication[] = [];

    for (const a of memoryApplications.values()) {
      if (a.userId === userId) {
        allUserMemApps.push(a);
        if (!statusFilter || statusFilter === "All" || a.status === statusFilter) {
          results.push(a);
        }
      }
    }

    const sorted = results.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
    const metrics = this.calculateATSMetrics(allUserMemApps);

    return { applications: sorted, metrics };
  }

  /**
   * Updates an application status, deadline, or notes with state transition guards
   */
  static async updateApplication(userId: string, applicationId: string, updates: UpdateApplicationInput): Promise<Partial<IApplicationTrackerDocument | MemoryApplication>> {
    const db = await connectToDatabase();

    if (db) {
      try {
        const app = await ApplicationTracker.findById(applicationId);
        if (app) {
          if (app.userId.toString() !== userId) {
            throw new AuthError("Unauthorized access to requested application");
          }

          if (updates.status) {
            this.validateStatusTransition(app.status, updates.status);
            app.status = updates.status;
          }
          if (updates.notes !== undefined) app.notes = updates.notes;
          if (updates.deadlineAt) app.deadlineAt = new Date(updates.deadlineAt);
          if (updates.nextFollowUpAt) app.nextFollowUpAt = new Date(updates.nextFollowUpAt);

          await app.save();
          return app;
        }
      } catch (err) {
        if (err instanceof AuthError || err instanceof ValidationError) throw err;
      }
    }

    const memApp = memoryApplications.get(applicationId);
    if (!memApp) {
      throw new NotFoundError(`Application record '${applicationId}' not found.`);
    }

    if (memApp.userId !== userId) {
      throw new AuthError("Unauthorized access to requested application");
    }

    if (updates.status) {
      this.validateStatusTransition(memApp.status, updates.status);
      memApp.status = updates.status as ApplicationStatus;
    }
    if (updates.notes !== undefined) memApp.notes = updates.notes;
    if (updates.deadlineAt) memApp.deadlineAt = new Date(updates.deadlineAt);
    if (updates.nextFollowUpAt) memApp.nextFollowUpAt = new Date(updates.nextFollowUpAt);
    memApp.updatedAt = new Date();

    return memApp;
  }

  /**
   * Deletes an application record from ATS
   */
  static async deleteApplication(userId: string, applicationId: string): Promise<boolean> {
    const db = await connectToDatabase();

    if (db) {
      try {
        const app = await ApplicationTracker.findById(applicationId);
        if (app) {
          if (app.userId.toString() !== userId) {
            throw new AuthError("Unauthorized access to requested application");
          }
          await ApplicationTracker.findByIdAndDelete(applicationId);
          return true;
        }
      } catch (err) {
        if (err instanceof AuthError) throw err;
      }
    }

    const memApp = memoryApplications.get(applicationId);
    if (memApp && memApp.userId === userId) {
      memoryApplications.delete(applicationId);
      return true;
    }

    return false;
  }
}
