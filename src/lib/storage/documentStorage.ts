import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOADS_BASE_DIR = path.join(process.cwd(), "uploads", "vault");

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
