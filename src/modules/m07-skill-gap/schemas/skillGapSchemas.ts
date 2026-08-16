import { z } from "zod";

export const analyzeSkillGapSchema = z.object({
  roleId: z.string().min(1, "Target role ID is required"),
});

export const addSkillToProfileSchema = z.object({
  skillName: z.string().min(1, "Skill name is required").trim(),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("INTERMEDIATE"),
});

export type AnalyzeSkillGapRequest = z.infer<typeof analyzeSkillGapSchema>;
export type AddSkillToProfileRequest = z.infer<typeof addSkillToProfileSchema>;
