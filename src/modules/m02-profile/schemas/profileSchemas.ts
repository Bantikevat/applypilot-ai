import { z } from "zod";

export const personalInfoSchema = z.object({
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  category: z.enum(["General", "OBC", "SC", "ST", "EWS", "Other"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
});

export const educationItemSchema = z.object({
  id: z.string().optional(),
  level: z.enum(["10th", "12th", "Diploma", "Graduation", "Post Graduation", "Certification", "Other"]),
  degree: z.string().min(1, "Degree/Course title is required"),
  institution: z.string().min(1, "Institution/School/College name is required"),
  boardOrUniversity: z.string().optional(),
  yearOfPassing: z.number().min(1950).max(2035),
  percentageOrCgpa: z.string().optional(),
  specialization: z.string().optional(),
  isPursuing: z.boolean().default(false).optional(),
});

export const experienceItemSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Job role is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  responsibilities: z.string().optional(),
});

export const skillsSchema = z.object({
  technicalSkills: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  toolsAndFrameworks: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});

export const preferencesSchema = z.object({
  preferredJobTypes: z.array(z.enum(["Government", "Private", "MNC", "Startup", "PSU"])).default([]),
  preferredWorkModes: z.array(z.enum(["Remote", "Hybrid", "On-site"])).default([]),
  preferredLocations: z.array(z.string()).default([]),
  targetSalaryMin: z.number().optional(),
  targetRoles: z.array(z.string()).default([]),
});

export const updateProfileSchema = z.object({
  personal: personalInfoSchema.optional(),
  education: z.array(educationItemSchema).optional(),
  experience: z.array(experienceItemSchema).optional(),
  skills: skillsSchema.optional(),
  preferences: preferencesSchema.optional(),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type EducationItemInput = z.infer<typeof educationItemSchema>;
export type ExperienceItemInput = z.infer<typeof experienceItemSchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
