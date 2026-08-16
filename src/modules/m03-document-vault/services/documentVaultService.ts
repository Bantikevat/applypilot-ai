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
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new ValidationError(`Unsupported file format '${mimeType}'. Allowed formats: PDF, JPEG, PNG, WEBP.`);
    }

    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError("File size exceeds 10MB limit.");
    }

    const { storagePath } = await DocumentStorage.saveFile(userId, fileBuffer, originalFileName);

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
        console.warn("MongoDB offline, saving document metadata in Memory Store:", err);
      }
    }

    const docId = `mem_doc_${Date.now()}`;
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
    return memDoc;
  }

  /**
   * Retrieves candidate vault documents filtered by optional category
   */
  static async getUserDocuments(userId: string, category?: string): Promise<Array<Partial<IDocumentVaultDocument | MemoryDocument>>> {
    const db = await connectToDatabase();

    if (db) {
      try {
        const query: any = { userId };
        if (category && category !== "All") {
          query.category = category;
        }
        return await DocumentVault.find(query).sort({ createdAt: -1 });
      } catch {
        console.warn("MongoDB offline, reading from Memory Vault.");
      }
    }

    const results: MemoryDocument[] = [];
    for (const doc of memoryVault.values()) {
      if (doc.userId === userId) {
        if (!category || category === "All" || doc.category === category) {
          results.push(doc);
        }
      }
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
          if (doc.userId.toString() !== userId) {
            throw new AuthError("Unauthorized access to requested document");
          }
          return doc;
        }
      } catch (err) {
        if (err instanceof AuthError) throw err;
      }
    }

    const memDoc = memoryVault.get(documentId);
    if (!memDoc) {
      throw new NotFoundError("Requested document not found in Vault");
    }

    if (memDoc.userId !== userId) {
      throw new AuthError("Unauthorized access to requested document");
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
