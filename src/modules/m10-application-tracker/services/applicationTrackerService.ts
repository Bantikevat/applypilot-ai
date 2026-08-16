import { ApplicationTracker, IApplicationTrackerDocument } from "../models/ApplicationTracker";
import { CreateApplicationInput, UpdateApplicationInput } from "../schemas/trackerSchemas";
import { connectToDatabase } from "@/lib/db/mongoose";
import { NotFoundError, AuthError } from "@/lib/errors/AppError";

export interface MemoryApplication {
  _id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  applicationUrl?: string;
  status: "SAVED" | "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "OFFER_RECEIVED" | "REJECTED" | "WITHDRAWN";
  portalCategory: "Government" | "Corporate" | "Remote" | "Other";
  appliedAt: Date;
  deadlineAt?: Date;
  nextFollowUpAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const memoryApplications = new Map<string, MemoryApplication>();

export interface ATSMetricsSummary {
  totalCount: number;
  savedCount: number;
  appliedCount: number;
  underReviewCount: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  offerConversionPercentage: number;
}

export class ApplicationTrackerService {
  /**
   * Computes ATS metrics summary for a candidate
   */
  static calculateATSMetrics(apps: Array<Partial<IApplicationTrackerDocument | MemoryApplication>>): ATSMetricsSummary {
    let saved = 0;
    let applied = 0;
    let underReview = 0;
    let interview = 0;
    let offer = 0;
    let rejected = 0;

    for (const a of apps) {
      switch (a.status) {
        case "SAVED": saved++; break;
        case "APPLIED": applied++; break;
        case "UNDER_REVIEW": case "SHORTLISTED": underReview++; break;
        case "INTERVIEW_SCHEDULED": interview++; break;
        case "OFFER_RECEIVED": offer++; break;
        case "REJECTED": case "WITHDRAWN": rejected++; break;
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
      rejectedCount: rejected,
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
      status: input.status,
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
   * Updates an application status, deadline, or notes
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

          if (updates.status) app.status = updates.status;
          if (updates.notes !== undefined) app.notes = updates.notes;
          if (updates.deadlineAt) app.deadlineAt = new Date(updates.deadlineAt);
          if (updates.nextFollowUpAt) app.nextFollowUpAt = new Date(updates.nextFollowUpAt);

          await app.save();
          return app;
        }
      } catch (err) {
        if (err instanceof AuthError) throw err;
      }
    }

    const memApp = memoryApplications.get(applicationId);
    if (!memApp) {
      throw new NotFoundError(`Application record '${applicationId}' not found.`);
    }

    if (memApp.userId !== userId) {
      throw new AuthError("Unauthorized access to requested application");
    }

    if (updates.status) memApp.status = updates.status;
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
