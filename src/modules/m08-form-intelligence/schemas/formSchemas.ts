import { z } from "zod";

export const formFieldInputSchema = z.object({
  fieldIdentifier: z.string().min(1, "Field identifier is required"),
  label: z.string().optional(),
  inputType: z.string().default("text"),
  isRequired: z.boolean().default(false),
});

export const generatePlanRequestSchema = z.object({
  targetPortal: z.string().default("Generic Portal"),
  fields: z.array(formFieldInputSchema).min(1, "At least one form field is required"),
});

export const mapFieldsRequestSchema = z.object({
  fieldIdentifiers: z.array(z.string()).min(1, "At least one field identifier is required"),
});

export type FormFieldInput = z.infer<typeof formFieldInputSchema>;
export type GeneratePlanRequest = z.infer<typeof generatePlanRequestSchema>;
export type MapFieldsRequest = z.infer<typeof mapFieldsRequestSchema>;
