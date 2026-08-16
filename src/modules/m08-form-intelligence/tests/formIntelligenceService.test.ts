import { describe, it, expect } from "vitest";
import { generatePlanRequestSchema, mapFieldsRequestSchema } from "../schemas/formSchemas";
import { FormIntelligenceService } from "../services/formIntelligenceService";

describe("M08 — Smart Application Intelligence Unit & Service Tests", () => {
  it("should validate generate plan request schema correctly", () => {
    const validReq = {
      targetPortal: "UPSC Official",
      fields: [
        { fieldIdentifier: "full_name", label: "Full Name", isRequired: true },
        { fieldIdentifier: "dob", label: "Date of Birth", isRequired: true },
      ],
    };

    const res = generatePlanRequestSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should match fuzzy DOM field identifiers to canonical dictionary rules", () => {
    const rule1 = FormIntelligenceService.matchCanonicalField("candidate_full_name", "Full Name");
    expect(rule1).toBeDefined();
    expect(rule1?.canonicalName).toBe("Full Name");

    const rule2 = FormIntelligenceService.matchCanonicalField("date_of_birth");
    expect(rule2).toBeDefined();
    expect(rule2?.canonicalName).toBe("Date of Birth");

    const rule3 = FormIntelligenceService.matchCanonicalField("upload_resume");
    expect(rule3).toBeDefined();
    expect(rule3?.canonicalName).toBe("Resume Document File");
  });

  it("should generate pre-fill plan with readiness score and validation audit", async () => {
    const userId = "test_intelligence_user_123";
    const sampleFields = [
      { fieldIdentifier: "full_name", label: "Full Name", isRequired: true },
      { fieldIdentifier: "email_address", label: "Email Address", isRequired: true },
      { fieldIdentifier: "dob", label: "Date of Birth", isRequired: true },
    ];

    const result = await FormIntelligenceService.generatePreFillPlan(userId, "SSC Official Portal", sampleFields);

    expect(result).toBeDefined();
    expect(result.targetPortal).toBe("SSC Official Portal");
    expect(result.totalFieldsCount).toBe(3);
    expect(result.plan.length).toBe(3);
    expect(result.overallFormReadinessScore).toBeGreaterThanOrEqual(0);
  });
});
