import { z } from "zod";

export const processPhotoConfigSchema = z.object({
  presetId: z.string().optional(),
  targetWidthPx: z.number().min(50).max(4000).default(350),
  targetHeightPx: z.number().min(50).max(4000).default(450),
  targetMaxKb: z.number().min(5).max(10240).default(50),
  outputFormat: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
  quality: z.number().min(10).max(100).default(85),
  exportToVault: z.boolean().default(false),
});

export const processSignatureConfigSchema = z.object({
  presetId: z.string().optional(),
  targetWidthPx: z.number().min(50).max(4000).default(140),
  targetHeightPx: z.number().min(20).max(2000).default(60),
  targetMaxKb: z.number().min(5).max(5120).default(20),
  enhanceContrast: z.boolean().default(true),
  outputFormat: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
  exportToVault: z.boolean().default(false),
});

export type ProcessPhotoConfig = z.infer<typeof processPhotoConfigSchema>;
export type ProcessSignatureConfig = z.infer<typeof processSignatureConfigSchema>;
