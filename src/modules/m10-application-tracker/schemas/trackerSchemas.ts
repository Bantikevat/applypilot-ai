import { z } from "zod";

export const applicationStatusEnum = z.enum([
  "SAVED",
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "OFFER_RECEIVED",
  "REJECTED",
  "WITHDRAWN",
]);

export const portalCategoryEnum = z.enum(["Government", "Corporate", "Remote", "Other"]);

export const createApplicationSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required").trim(),
  company: z.string().min(1, "Company name is required").trim(),
  applicationUrl: z.string().url().optional().or(z.literal("")),
  status: applicationStatusEnum.default("APPLIED"),
  portalCategory: portalCategoryEnum.default("Corporate"),
  appliedAt: z.string().optional(),
  deadlineAt: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
  notes: z.string().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export type ApplicationStatus = z.infer<typeof applicationStatusEnum>;
export type PortalCategory = z.infer<typeof portalCategoryEnum>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
