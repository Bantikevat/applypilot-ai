import { z } from "zod";

export const assistantStepEnum = z.enum([
  "SESSION_STARTED",
  "PRE_FILL_GENERATED",
  "AWAITING_HUMAN_REVIEW",
  "APPROVED_FOR_SUBMIT",
]);

export const startAssistantSessionSchema = z.object({
  jobId: z.string().optional(),
  targetPortalUrl: z.string().url("Must be a valid portal URL").default("https://ssc.gov.in/apply"),
  portalName: z.string().default("SSC Official Portal"),
});

export const confirmStepSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  modifiedFields: z.record(z.string()).optional(),
  candidateApproved: z.boolean().default(true),
});

export type AssistantStep = z.infer<typeof assistantStepEnum>;
export type StartAssistantSessionRequest = z.infer<typeof startAssistantSessionSchema>;
export type ConfirmStepRequest = z.infer<typeof confirmStepSchema>;
