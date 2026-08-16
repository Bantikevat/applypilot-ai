import { z } from "zod";

export const evaluateMatchRequestSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

export const eligibilityVerdictEnum = z.enum(["ELIGIBLE", "PARTIALLY_ELIGIBLE", "INELIGIBLE"]);

export type EvaluateMatchRequest = z.infer<typeof evaluateMatchRequestSchema>;
export type EligibilityVerdict = z.infer<typeof eligibilityVerdictEnum>;
