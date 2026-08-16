import { z } from "zod";

export const triggerSyncSchema = z.object({
  adapterId: z.enum(["ALL", "govt-ssc-upsc", "company-career"]).default("ALL"),
});

export const userQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
});

export type TriggerSyncInput = z.infer<typeof triggerSyncSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
