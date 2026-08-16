import { describe, it, expect } from "vitest";
import { createApplicationSchema, updateApplicationSchema } from "../schemas/trackerSchemas";
import { ApplicationTrackerService } from "../services/applicationTrackerService";
import { ValidationError } from "@/lib/errors/AppError";

describe("M10 — Application Tracker (Candidate ATS) Unit & Service Tests", () => {
  it("should validate create application schema correctly", () => {
    const validReq = {
      jobTitle: "Senior AI Engineer",
      company: "Google",
      status: "APPLIED" as const,
      portalCategory: "Corporate" as const,
    };

    const res = createApplicationSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should calculate ATS metrics summary correctly", () => {
    const apps = [
      { status: "SAVED" as const },
      { status: "APPLIED" as const },
      { status: "INTERVIEW_SCHEDULED" as const },
      { status: "OFFER_RECEIVED" as const },
    ];

    const metrics = ApplicationTrackerService.calculateATSMetrics(apps as any);

    expect(metrics.totalCount).toBe(4);
    expect(metrics.appliedCount).toBe(1);
    expect(metrics.interviewCount).toBe(1);
    expect(metrics.offerCount).toBe(1);
    expect(metrics.offerConversionPercentage).toBe(33); // 1 offer / 3 active non-saved = 33%
  });

  it("should enforce state machine transition rules and prevent invalid transitions out of terminal states (REJECTED -> INTERVIEW_SCHEDULED)", async () => {
    const userId = "test_ats_user_guards";

    const app = await ApplicationTrackerService.createApplication(userId, {
      jobTitle: "Systems Architect",
      company: "DeepMind",
      status: "APPLIED",
      portalCategory: "Corporate",
    });

    // Valid transition: APPLIED -> REJECTED
    await ApplicationTrackerService.updateApplication(userId, app._id as string, { status: "REJECTED" });

    // Invalid transition: REJECTED -> INTERVIEW_SCHEDULED should throw ValidationError
    await expect(
      ApplicationTrackerService.updateApplication(userId, app._id as string, { status: "INTERVIEW_SCHEDULED" })
    ).rejects.toThrowError(ValidationError);
  });

  it("should create, update, list, and delete candidate application in ATS store", async () => {
    const userId = "test_ats_user_123";

    // 1. Create Application
    const app = await ApplicationTrackerService.createApplication(userId, {
      jobTitle: "Fullstack Developer",
      company: "Acme Corp",
      status: "APPLIED",
      portalCategory: "Corporate",
      notes: "First round pending",
    });

    expect(app._id).toBeDefined();
    expect(app.jobTitle).toBe("Fullstack Developer");

    // 2. Fetch User Applications
    const { applications, metrics } = await ApplicationTrackerService.getUserApplications(userId);
    expect(applications.length).toBeGreaterThan(0);
    expect(metrics.totalCount).toBeGreaterThan(0);

    // 3. Update Status to INTERVIEW_SCHEDULED
    const updated = await ApplicationTrackerService.updateApplication(userId, app._id as string, {
      status: "INTERVIEW_SCHEDULED",
      notes: "Technical interview set for Friday",
    });
    expect(updated.status).toBe("INTERVIEW_SCHEDULED");

    // 4. Delete Application
    const deleted = await ApplicationTrackerService.deleteApplication(userId, app._id as string);
    expect(deleted).toBe(true);
  });
});
