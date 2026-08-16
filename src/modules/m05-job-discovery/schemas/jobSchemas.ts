import { z } from "zod";

export const jobStatusEnum = z.enum(["ACTIVE", "EXPIRED", "SUSPICIOUS"]);
export const trustBadgeEnum = z.enum([
  "Verified Official Source",
  "High Confidence",
  "Needs Verification",
  "Suspicious / Application Fee Warning",
]);

export const canonicalJobInputSchema = z.object({
  title: z.string().min(1, "Job title is required").trim(),
  company: z.string().min(1, "Company name is required").trim(),
  location: z.string().min(1, "Location is required").trim(),
  employmentType: z.enum(["Full-time", "Part-time", "Contract", "Government", "Remote"]).default("Full-time"),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().default("INR"),
  minExperienceYears: z.number().min(0).default(0),
  maxExperienceYears: z.number().optional(),
  educationRequirements: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  description: z.string().min(10, "Job description must be at least 10 characters"),
  requirements: z.array(z.string()).default([]),
  applicationUrl: z.string().url("Must be a valid application URL"),
  source: z.string().min(1, "Source identifier is required"),
  sourceUrl: z.string().url().optional(),
  postedAt: z.string().nullable().optional(),
  sourceAdapter: z.string().optional(),
  workMode: z.string().optional(),
  sourceCategory: z.string().optional(),
  externalJobId: z.string().optional(),
  rawPayload: z.any().optional(),
});

export const jobSearchQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  sourceCategory: z.string().default("All"),
  minExperience: z.number().optional(),
  trustBadge: trustBadgeEnum.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

export type CanonicalJobInput = z.infer<typeof canonicalJobInputSchema>;
export type JobSearchQuery = z.infer<typeof jobSearchQuerySchema>;
