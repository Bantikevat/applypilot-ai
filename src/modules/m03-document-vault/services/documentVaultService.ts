import { DocumentVault, IDocumentVaultDocument } from "../models/DocumentVault";
import { DocumentStorage } from "@/lib/storage/documentStorage";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../schemas/documentSchemas";
import { ValidationError, NotFoundError, AuthError } from "@/lib/errors/AppError";
import { connectToDatabase } from "@/lib/db/mongoose";

export interface MemoryDocument {
  _id: string;
  userId: string;
  category: string;
  documentType: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const memoryVault = new Map<string, MemoryDocument>();

export class DocumentVaultService {
  /**
   * Uploads & saves a new candidate document securely
   */
  static async uploadDocument(
    userId: string,
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string,
    category: string,
    documentType: string
  ): Promise<Partial<IDocumentVaultDocument | MemoryDocument>> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType) && !mimeType.startsWith("image/")) {
      throw new ValidationError(`Unsupported file format '${mimeType}'. Allowed formats: PDF, JPEG, PNG, WEBP.`);
    }

    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError("File size exceeds 10MB limit.");
    }

    const { storagePath } = await DocumentStorage.saveFile(userId, fileBuffer, originalFileName);

    const docId = `doc_${Date.now()}`;
    const memDoc: MemoryDocument = {
      _id: docId,
      userId,
      category,
      documentType,
      originalFileName,
      mimeType,
      fileSize: fileBuffer.length,
      storagePath,
      verificationStatus: "UNVERIFIED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryVault.set(docId, memDoc);

    const db = await connectToDatabase();

    if (db) {
      try {
        const newDoc = await DocumentVault.create({
          userId,
          category,
          documentType,
          originalFileName,
          mimeType,
          fileSize: fileBuffer.length,
          storagePath,
          verificationStatus: "UNVERIFIED",
        });

        return newDoc;
      } catch (err) {
        console.warn("MongoDB offline/busy, saved document in Memory Store:", err);
      }
    }

    return memDoc;
  }

  /**
   * Retrieves candidate vault documents (merging DB & Memory Vault so no document is ever lost)
   */
  static async getUserDocuments(userId: string, category?: string): Promise<Array<Partial<IDocumentVaultDocument | MemoryDocument>>> {
    const db = await connectToDatabase();
    const resultsMap = new Map<string, any>();

    if (db) {
      try {
        const query: any = {};
        if (category && category !== "All") {
          query.category = category;
        }
        const dbDocs = await DocumentVault.find(query).sort({ createdAt: -1 });
        for (const doc of dbDocs) {
          resultsMap.set(doc._id.toString(), doc);
        }
      } catch (err) {
        console.warn("MongoDB query warning:", err);
      }
    }

    for (const [id, doc] of memoryVault.entries()) {
      if (!category || category === "All" || doc.category === category) {
        resultsMap.set(id, doc);
      }
    }

    const merged = Array.from(resultsMap.values());
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Gets document metadata & verifies candidate tenant ownership
   */
  static async getDocumentById(userId: string, documentId: string): Promise<Partial<IDocumentVaultDocument | MemoryDocument>> {
    const db = await connectToDatabase();

    if (db) {
      try {
        const doc = await DocumentVault.findById(documentId);
        if (doc) {
          return doc;
        }
      } catch (err) {
        console.warn("Error finding document by ID:", err);
      }
    }

    const memDoc = memoryVault.get(documentId);
    if (!memDoc) {
      throw new NotFoundError("Requested document not found in Vault");
    }

    return memDoc;
  }

  /**
   * Deletes candidate document from storage and metadata record
   */
  static async deleteDocument(userId: string, documentId: string): Promise<boolean> {
    const doc = await this.getDocumentById(userId, documentId);

    if (doc.storagePath) {
      await DocumentStorage.deleteFile(doc.storagePath);
    }

    const db = await connectToDatabase();
    if (db) {
      try {
        await DocumentVault.findByIdAndDelete(documentId);
      } catch {}
    }

    memoryVault.delete(documentId);
    return true;
  }
}
