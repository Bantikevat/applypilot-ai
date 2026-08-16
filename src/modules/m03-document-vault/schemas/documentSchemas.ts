import { z } from "zod";

export const categoryEnum = z.enum([
  "Photograph",
  "Signature",
  "Identity",
  "Education",
  "Experience",
  "Resume",
  "Other",
]);

export const documentTypeEnum = z.enum([
  "Passport Photo",
  "Signature Specimen",
  "Aadhaar Card",
  "PAN Card",
  "Passport",
  "Voter ID",
  "Driving License",
  "10th Marksheet",
  "12th Certificate",
  "Graduation Degree",
  "Post Graduation Degree",
  "Relieving Letter",
  "Experience Certificate",
  "Pay Slip",
  "Resume / CV",
  "Other Document",
]);

export const uploadMetadataSchema = z.object({
  category: categoryEnum,
  documentType: documentTypeEnum,
});

export type DocumentCategory = z.infer<typeof categoryEnum>;
export type DocumentType = z.infer<typeof documentTypeEnum>;
export type UploadMetadataInput = z.infer<typeof uploadMetadataSchema>;

// Allowed MIME types for Document Vault
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Maximum allowed file size: 10MB
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
