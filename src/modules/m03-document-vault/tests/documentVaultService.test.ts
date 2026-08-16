import { describe, it, expect } from "vitest";
import { uploadMetadataSchema, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../schemas/documentSchemas";
import { DocumentVaultService } from "../services/documentVaultService";

describe("M03 — Document Vault Unit & Service Tests", () => {
  it("should validate metadata schema correctly", () => {
    const validMetadata = {
      category: "Resume" as const,
      documentType: "Resume / CV" as const,
    };

    const res = uploadMetadataSchema.safeParse(validMetadata);
    expect(res.success).toBe(true);
  });

  it("should reject invalid category metadata", () => {
    const invalidMetadata = {
      category: "InvalidCategory",
      documentType: "Resume / CV",
    };

    const res = uploadMetadataSchema.safeParse(invalidMetadata);
    expect(res.success).toBe(false);
  });

  it("should allow supported MIME types (PDF, JPEG, PNG, WEBP)", () => {
    expect(ALLOWED_MIME_TYPES).toContain("application/pdf");
    expect(ALLOWED_MIME_TYPES).toContain("image/jpeg");
    expect(ALLOWED_MIME_TYPES).toContain("image/png");
    expect(ALLOWED_MIME_TYPES).toContain("image/webp");
  });

  it("should reject files exceeding 10MB limit in service", async () => {
    const userId = "test_user_file_size_exceeded";
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

    await expect(
      DocumentVaultService.uploadDocument(
        userId,
        largeBuffer,
        "large_file.pdf",
        "application/pdf",
        "Resume",
        "Resume / CV"
      )
    ).rejects.toThrow("File size exceeds 10MB limit.");
  });

  it("should upload and retrieve document metadata in memory vault successfully", async () => {
    const userId = "test_vault_user_123";
    const sampleBuffer = Buffer.from("Sample Candidate Resume Content PDF");

    const uploaded = await DocumentVaultService.uploadDocument(
      userId,
      sampleBuffer,
      "candidate_resume.pdf",
      "application/pdf",
      "Resume",
      "Resume / CV"
    );

    expect(uploaded).toBeDefined();
    expect(uploaded.originalFileName).toBe("candidate_resume.pdf");
    expect(uploaded.category).toBe("Resume");
    expect(uploaded.verificationStatus).toBe("UNVERIFIED");

    const docs = await DocumentVaultService.getUserDocuments(userId, "Resume");
    expect(docs.length).toBeGreaterThan(0);
    expect(docs[0].originalFileName).toBe("candidate_resume.pdf");
  });
});
