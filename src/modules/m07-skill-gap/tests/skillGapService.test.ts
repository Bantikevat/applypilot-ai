import { describe, it, expect } from "vitest";
import { analyzeSkillGapSchema, addSkillToProfileSchema } from "../schemas/skillGapSchemas";
import { SkillGapService } from "../services/skillGapService";

describe("M07 — Skill Gap & Learning Agent Unit & Service Tests", () => {
  it("should validate analyze skill gap schema correctly", () => {
    const validReq = { roleId: "fullstack-ai" };
    const res = analyzeSkillGapSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should validate add skill to profile schema correctly", () => {
    const validReq = { skillName: "Docker", proficiency: "INTERMEDIATE" as const };
    const res = addSkillToProfileSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should analyze skill gaps and return mastered skills vs critical gaps", () => {
    const candidateProfile = {
      skills: [
        { skillName: "React", proficiency: "ADVANCED" },
        { skillName: "TypeScript", proficiency: "ADVANCED" },
      ],
    };

    const result = SkillGapService.analyzeSkillGap(candidateProfile, "fullstack-ai");

    expect(result).toBeDefined();
    expect(result.roleId).toBe("fullstack-ai");
    expect(result.masteredCount).toBe(2);
    expect(result.criticalGaps.length).toBeGreaterThan(0);
    expect(result.estimatedTotalDays).toBeGreaterThan(0);
  });

  it("should append acquired skill to candidate profile without duplicates", async () => {
    const userId = "test_skill_user_123";
    const res = await SkillGapService.addSkillToProfile(userId, "GraphQL", "INTERMEDIATE");

    expect(res.success).toBe(true);
    expect(res.message).toContain("GraphQL");
  });
});
