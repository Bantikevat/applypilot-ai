import { z } from "zod";

export const analyticsFilterSchema = z.object({
  timeframe: z.enum(["30_DAYS", "90_DAYS", "6_MONTHS", "ALL_TIME"]).default("ALL_TIME"),
  portalCategory: z.enum(["ALL", "Government", "Corporate", "Remote"]).default("ALL"),
});

export const salaryTrendQuerySchema = z.object({
  roleId: z.string().optional(),
});

export type AnalyticsFilter = z.infer<typeof analyticsFilterSchema>;
export type SalaryTrendQuery = z.infer<typeof salaryTrendQuerySchema>;
