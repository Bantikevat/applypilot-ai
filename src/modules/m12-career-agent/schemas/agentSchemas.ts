import { z } from "zod";

export const advisorTopicEnum = z.enum([
  "GENERAL_CAREER",
  "RESUME_ADVICE",
  "INTERVIEW_PREP",
  "GOVT_EXAM_PREP",
  "SKILL_UPGRADE",
  "SALARY_NEGOTIATION",
  "CAREER_PIVOT",
]);

export const chatMessageInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty").max(2000, "Prompt exceeds 2000 characters").trim(),
  topic: advisorTopicEnum.default("GENERAL_CAREER"),
});

export type AdvisorTopic = z.infer<typeof advisorTopicEnum>;
export type ChatMessageInput = z.infer<typeof chatMessageInputSchema>;
