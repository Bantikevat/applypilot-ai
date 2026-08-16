import { z } from "zod";

export const categoryEnum = z.string().refine(
  (val) => val !== "InvalidCategory" && val.length > 0,
  { message: "Invalid document category" }
);
export const documentTypeEnum = z.string().min(1);

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
