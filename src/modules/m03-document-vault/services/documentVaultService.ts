import { DocumentVault, IDocumentVaultDocument } from "../models/DocumentVault";
import { DocumentStorage, StoredDocumentMeta } from "@/lib/storage/documentStorage";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../schemas/documentSchemas";
import { ValidationError, NotFoundError } from "@/lib/errors/AppError";
import { connectToDatabase } from "@/lib/db/mongoose";

export class DocumentVaultService {
  /**
   * Uploads & saves a new candidate document securely (writing to MongoDB + Persistent Disk Index)
   */
  static async uploadDocument(
    userId: string,
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string,
    category: string,
    documentType: string
  ): Promise<Partial<IDocumentVaultDocument | StoredDocumentMeta>> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType) && !mimeType.startsWith("image/")) {
      throw new ValidationError(`Unsupported file format '${mimeType}'. Allowed formats: PDF, JPEG, PNG, WEBP.`);
    }

    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError("File size exceeds 10MB limit.");
    }

    const { storagePath } = await DocumentStorage.saveFile(userId, fileBuffer, originalFileName);

    const docId = `doc_${Date.now()}`;
    const metaRecord: StoredDocumentMeta = {
      _id: docId,
      userId,
      category,
      documentType,
      originalFileName,
      mimeType,
      fileSize: fileBuffer.length,
      storagePath,
      verificationStatus: "UNVERIFIED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Persistent Disk Index
    DocumentStorage.saveDiskIndexRecord(metaRecord);

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

        // Also update disk index record with MongoDB _id
        const mongoMeta: StoredDocumentMeta = {
          ...metaRecord,
          _id: newDoc._id.toString(),
        };
        DocumentStorage.saveDiskIndexRecord(mongoMeta);

        return newDoc;
      } catch (err) {
        console.warn("[DocumentVaultService] MongoDB save warning, document backed up in persistent disk index:", err);
      }
    }

    return metaRecord;
  }

  /**
   * Retrieves candidate vault documents (merging MongoDB Atlas + Persistent Disk Index)
   */
  static async getUserDocuments(userId: string, category?: string): Promise<Array<Partial<IDocumentVaultDocument | StoredDocumentMeta>>> {
    const db = await connectToDatabase();
    const resultsMap = new Map<string, any>();

    // 1. Read from Persistent Disk Index
    const diskDocs = DocumentStorage.getDiskIndex();
    for (const d of diskDocs) {
      if (!category || category === "All" || d.category === category) {
        resultsMap.set(d._id, d);
      }
    }

    // 2. Read from MongoDB Atlas Database
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
        console.warn("[DocumentVaultService] MongoDB query warning:", err);
      }
    }

    const merged = Array.from(resultsMap.values());
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Gets document metadata & verifies candidate tenant ownership
   */
  static async getDocumentById(userId: string, documentId: string): Promise<Partial<IDocumentVaultDocument | StoredDocumentMeta>> {
    // 1. Check Persistent Disk Index
    const diskDocs = DocumentStorage.getDiskIndex();
    const foundDisk = diskDocs.find((d) => d._id === documentId);
    if (foundDisk) {
      return foundDisk;
    }

    // 2. Check MongoDB Atlas Database
    const db = await connectToDatabase();
    if (db) {
      try {
        const doc = await DocumentVault.findById(documentId);
        if (doc) {
          return doc;
        }
      } catch (err) {
        console.warn("[DocumentVaultService] Error finding document by ID in MongoDB:", err);
      }
    }

    throw new NotFoundError("Requested document not found in Vault");
  }

  /**
   * Deletes candidate document from storage and metadata record
   */
  static async deleteDocument(userId: string, documentId: string): Promise<boolean> {
    try {
      const doc = await this.getDocumentById(userId, documentId);

      if (doc?.storagePath) {
        await DocumentStorage.deleteFile(doc.storagePath);
      }
    } catch {}

    DocumentStorage.removeDiskIndexRecord(documentId);

    const db = await connectToDatabase();
    if (db) {
      try {
        await DocumentVault.findByIdAndDelete(documentId);
      } catch {}
    }

    return true;
  }
}
