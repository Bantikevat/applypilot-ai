import { describe, it, expect } from "vitest";
import { formFieldInputSchema } from "../schemas/formSchemas";
import { FormIntelligenceService } from "../services/formIntelligenceService";

describe("M08 — Smart Application Intelligence Unit & Service Tests", () => {
  it("should validate form field input schema correctly", () => {
    const validField = {
      fieldIdentifier: "candidate_name",
      label: "Full Name",
      isRequired: true,
    };
    const res = formFieldInputSchema.safeParse(validField);
    expect(res.success).toBe(true);
  });

  it("should match canonical field using exact alias or regex pattern", () => {
    const rule1 = FormIntelligenceService.matchCanonicalField("candidate_name", "Full Name");
    expect(rule1).not.toBeNull();
    expect(rule1?.canonicalName).toBe("Full Name");

    const rule2 = FormIntelligenceService.matchCanonicalField("greenhouse.candidate[first_name]", "First Name");
    expect(rule2).not.toBeNull();
    expect(rule2?.canonicalName).toBe("First Name");

    const rule3 = FormIntelligenceService.matchCanonicalField("lever.urls[LinkedIn]", "LinkedIn");
    expect(rule3).not.toBeNull();
    expect(rule3?.canonicalName).toBe("LinkedIn Profile URL");
  });

  it("should generate pre-fill plan with readiness score and validation audit", async () => {
    const userId = "test_form_user_123";
    const targetPortal = "Workday";
    const formFields = [
      { fieldIdentifier: "full_name", label: "Full Name", isRequired: true },
      { fieldIdentifier: "user_email", label: "Email Address", isRequired: true },
      { fieldIdentifier: "upload_resume", label: "Resume CV", isRequired: true },
    ];

    const result = await FormIntelligenceService.generatePreFillPlan(userId, targetPortal, formFields);

    expect(result).toBeDefined();
    expect(result.targetPortal).toBe("Workday");
    expect(result.totalFieldsCount).toBe(3);
    expect(result.plan.length).toBe(3);
  });

  it("should audit portal readiness against pre-defined Greenhouse portal template", async () => {
    const userId = "test_form_user_456";
    const result = await FormIntelligenceService.auditPortalReadiness(userId, "Greenhouse");

    expect(result).toBeDefined();
    expect(result.targetPortal).toBe("Greenhouse");
    expect(result.totalFieldsCount).toBeGreaterThan(0);
    expect(result.overallFormReadinessScore).toBeGreaterThanOrEqual(0);
  });

  it("should audit portal readiness against Government OTR portal template", async () => {
    const userId = "test_form_user_789";
    const result = await FormIntelligenceService.auditPortalReadiness(userId, "GovtOTR");

    expect(result).toBeDefined();
    expect(result.targetPortal).toBe("GovtOTR");
    expect(result.totalFieldsCount).toBe(9);
  });
});
