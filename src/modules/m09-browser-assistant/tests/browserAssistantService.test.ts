import { describe, it, expect } from "vitest";
import { startAssistantSessionSchema, confirmStepSchema } from "../schemas/assistantSchemas";
import { BrowserAssistantService } from "../services/browserAssistantService";

describe("M09 — Browser Application Assistant (HITL) Unit & Service Tests", () => {
  it("should validate start assistant session request schema correctly", () => {
    const validReq = {
      targetPortalUrl: "https://upsc.gov.in/apply",
      portalName: "UPSC Official Portal",
    };

    const res = startAssistantSessionSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should validate confirm step request schema correctly", () => {
    const validReq = {
      sessionId: "asst_sess_123",
      modifiedFields: { full_name: "Candidate Name Modified" },
      candidateApproved: true,
    };

    const res = confirmStepSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should start assistant session and pause at AWAITING_HUMAN_REVIEW HITL Gate", async () => {
    const userId = "test_assistant_user_123";
    const session = await BrowserAssistantService.startSession(
      userId,
      "https://ssc.gov.in/apply",
      "SSC Official Portal"
    );

    expect(session).toBeDefined();
    expect(session.sessionId).toBeDefined();
    expect(session.hitlProtectionActive).toBe(true);
    expect(session.currentStep).toBe("AWAITING_HUMAN_REVIEW");
    expect(session.candidateApproved).toBe(false);
  });

  it("should advance session step to APPROVED_FOR_SUBMIT after candidate HITL confirmation", async () => {
    const userId = "test_assistant_user_123";
    const session = await BrowserAssistantService.startSession(
      userId,
      "https://ssc.gov.in/apply",
      "SSC Official Portal"
    );

    const confirmedSession = await BrowserAssistantService.confirmHumanStep(
      session.sessionId,
      userId,
      { full_name: "John Doe Verified" },
      true
    );

    expect(confirmedSession.currentStep).toBe("APPROVED_FOR_SUBMIT");
    expect(confirmedSession.candidateApproved).toBe(true);
    expect(confirmedSession.injectionScript).toContain("John Doe Verified");
  });
});
