import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOADS_BASE_DIR = path.join(process.cwd(), "uploads", "vault");
const VAULT_INDEX_FILE = path.join(UPLOADS_BASE_DIR, "vault_index.json");

export interface StoredDocumentMeta {
  _id: string;
  userId: string;
  category: string;
  documentType: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export class DocumentStorage {
  /**
   * Ensures candidate vault directory exists securely
   */
  private static ensureUserDirectory(userId: string): string {
    const userDir = path.join(UPLOADS_BASE_DIR, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    return userDir;
  }

  /**
   * Loads all document metadata records persistently from disk index
   */
  static getDiskIndex(): StoredDocumentMeta[] {
    try {
      if (fs.existsSync(VAULT_INDEX_FILE)) {
        const content = fs.readFileSync(VAULT_INDEX_FILE, "utf-8");
        return JSON.parse(content) || [];
      }
    } catch (err) {
      console.warn("[DocumentStorage] Error reading vault_index.json from disk:", err);
    }
    return [];
  }

  /**
   * Saves metadata record persistently to disk index
   */
  static saveDiskIndexRecord(doc: StoredDocumentMeta): void {
    try {
      if (!fs.existsSync(UPLOADS_BASE_DIR)) {
        fs.mkdirSync(UPLOADS_BASE_DIR, { recursive: true });
      }
      const existing = this.getDiskIndex();
      const updated = [doc, ...existing.filter((d) => d._id !== doc._id)];
      fs.writeFileSync(VAULT_INDEX_FILE, JSON.stringify(updated, null, 2), "utf-8");
    } catch (err) {
      console.warn("[DocumentStorage] Error writing vault_index.json to disk:", err);
    }
  }

  /**
   * Removes metadata record persistently from disk index
   */
  static removeDiskIndexRecord(documentId: string): void {
    try {
      const existing = this.getDiskIndex();
      const filtered = existing.filter((d) => d._id !== documentId);
      fs.writeFileSync(VAULT_INDEX_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    } catch (err) {
      console.warn("[DocumentStorage] Error deleting from vault_index.json:", err);
    }
  }

  /**
   * Saves a file buffer securely with a randomized UUID filename
   */
  static async saveFile(userId: string, fileBuffer: Buffer, originalFileName: string): Promise<{ storagePath: string; fileName: string }> {
    const userDir = this.ensureUserDirectory(userId);
    const ext = path.extname(originalFileName) || ".bin";
    const uniqueFileName = `${crypto.randomUUID()}${ext}`;
    const fullPath = path.join(userDir, uniqueFileName);

    await fs.promises.writeFile(fullPath, fileBuffer);

    // Store normalized relative path
    const relativeStoragePath = `uploads/vault/${userId}/${uniqueFileName}`;

    return {
      storagePath: relativeStoragePath,
      fileName: uniqueFileName,
    };
  }

  /**
   * Reads a file buffer securely verifying file existence on disk
   */
  static async readFile(storagePath: string): Promise<Buffer | null> {
    const cleanPath = (storagePath || "").replace(/\\/g, "/");
    const fullPath = path.resolve(process.cwd(), cleanPath);

    if (!fs.existsSync(fullPath)) {
      console.warn("[DocumentStorage] File missing on disk at path:", fullPath);
      return null;
    }
    return fs.promises.readFile(fullPath);
  }

  /**
   * Deletes a file securely from disk storage
   */
  static async deleteFile(storagePath: string): Promise<boolean> {
    const cleanPath = (storagePath || "").replace(/\\/g, "/");
    const fullPath = path.resolve(process.cwd(), cleanPath);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    return false;
  }
}
