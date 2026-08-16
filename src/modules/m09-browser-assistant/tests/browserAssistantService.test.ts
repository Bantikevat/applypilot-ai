import { describe, it, expect } from "vitest";
import { startAssistantSessionSchema, confirmStepSchema } from "../schemas/assistantSchemas";
import { BrowserAssistantService } from "../services/browserAssistantService";
import { NotFoundError } from "@/lib/errors/AppError";

describe("M09 — Browser Application Assistant Unit & Service Tests", () => {
  it("should validate start session schema correctly", () => {
    const validReq = {
      targetPortalUrl: "https://ssc.gov.in/apply",
      portalName: "SSC CGL Portal",
    };
    const res = startAssistantSessionSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should validate confirm step schema correctly", () => {
    const validReq = {
      sessionId: "asst_sess_123",
      candidateApproved: true,
    };
    const res = confirmStepSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should initiate assistant session and pause at AWAITING_HUMAN_REVIEW HITL Gate", async () => {
    const userId = "test_asst_user_1";
    const session = await BrowserAssistantService.startSession(
      userId,
      "https://google.careers.com/apply",
      "Google Careers"
    );

    expect(session).toBeDefined();
    expect(session.sessionId).toContain("asst_sess_");
    expect(session.currentStep).toBe("AWAITING_HUMAN_REVIEW");
    expect(session.hitlProtectionActive).toBe(true);
    expect(session.candidateApproved).toBe(false);
    expect(session.injectionScript).toContain("ApplyPilot AI");
  });

  it("should confirm HITL step, apply manual candidate edits, and transition state to APPROVED_FOR_SUBMIT", async () => {
    const userId = "test_asst_user_2";
    const session = await BrowserAssistantService.startSession(
      userId,
      "https://workday.com/apply",
      "Workday"
    );

    const updatedSession = await BrowserAssistantService.confirmHumanStep(
      session.sessionId,
      userId,
      { full_name: "Banti Kevat (Verified)" },
      true
    );

    expect(updatedSession.candidateApproved).toBe(true);
    expect(updatedSession.currentStep).toBe("APPROVED_FOR_SUBMIT");
    expect(updatedSession.injectionScript).toContain("Banti Kevat (Verified)");
  });

  it("should throw NotFoundError for invalid session lookup", async () => {
    await expect(BrowserAssistantService.getSession("invalid_id", "user_1")).rejects.toThrowError(NotFoundError);
  });
});
