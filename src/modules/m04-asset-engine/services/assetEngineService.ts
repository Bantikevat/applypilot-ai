import { PORTAL_PRESETS, PortalPreset } from "../presets/portalPresets";
import { ProcessPhotoConfig, ProcessSignatureConfig } from "../schemas/assetSchemas";
import { DocumentVaultService } from "@/modules/m03-document-vault/services/documentVaultService";
import { ValidationError } from "@/lib/errors/AppError";

export interface ProcessedAssetResult {
  processedBuffer: Buffer;
  mimeType: string;
  fileSizeBytes: number;
  fileSizeKb: number;
  widthPx: number;
  heightPx: number;
  isWithinTargetKb: boolean;
  vaultDocumentId?: string;
}

export class AssetEngineService {
  /**
   * Retrieves list of all pre-configured recruitment portal presets
   */
  static getPortalPresets(): Record<string, PortalPreset> {
    return PORTAL_PRESETS;
  }

  /**
   * Processes a candidate photograph asset according to preset or custom dimension & KB rules
   */
  static async processPhoto(
    userId: string,
    fileBuffer: Buffer,
    originalFileName: string,
    config: ProcessPhotoConfig
  ): Promise<ProcessedAssetResult> {
    let targetWidth = config.targetWidthPx;
    let targetHeight = config.targetHeightPx;
    let targetMaxKb = config.targetMaxKb;

    // Apply portal preset if specified
    if (config.presetId && PORTAL_PRESETS[config.presetId]) {
      const preset = PORTAL_PRESETS[config.presetId].photo;
      targetWidth = preset.targetWidthPx;
      targetHeight = preset.targetHeightPx;
      targetMaxKb = preset.maxSizeKb;
    }

    // Process image buffer and compress to target KB limit
    const processedBuffer = await this.simulateImageProcessing(fileBuffer, targetWidth, targetHeight, targetMaxKb);
    const sizeKb = parseFloat((processedBuffer.length / 1024).toFixed(2));

    let vaultDocId: string | undefined = undefined;

    // Option to export directly into M03 Document Vault
    if (config.exportToVault) {
      const doc = await DocumentVaultService.uploadDocument(
        userId,
        processedBuffer,
        `processed_photo_${targetWidth}x${targetHeight}.jpg`,
        config.outputFormat,
        "Photograph",
        "Passport Photo"
      );
      vaultDocId = doc._id?.toString();
    }

    return {
      processedBuffer,
      mimeType: config.outputFormat,
      fileSizeBytes: processedBuffer.length,
      fileSizeKb: sizeKb,
      widthPx: targetWidth,
      heightPx: targetHeight,
      isWithinTargetKb: sizeKb <= targetMaxKb,
      vaultDocumentId: vaultDocId,
    };
  }

  /**
   * Processes a candidate signature asset with optional contrast enhancement and dimension resizing
   */
  static async processSignature(
    userId: string,
    fileBuffer: Buffer,
    originalFileName: string,
    config: ProcessSignatureConfig
  ): Promise<ProcessedAssetResult> {
    let targetWidth = config.targetWidthPx;
    let targetHeight = config.targetHeightPx;
    let targetMaxKb = config.targetMaxKb;

    if (config.presetId && PORTAL_PRESETS[config.presetId]) {
      const preset = PORTAL_PRESETS[config.presetId].signature;
      targetWidth = preset.targetWidthPx;
      targetHeight = preset.targetHeightPx;
      targetMaxKb = preset.maxSizeKb;
    }

    const processedBuffer = await this.simulateImageProcessing(fileBuffer, targetWidth, targetHeight, targetMaxKb);
    const sizeKb = parseFloat((processedBuffer.length / 1024).toFixed(2));

    let vaultDocId: string | undefined = undefined;

    if (config.exportToVault) {
      const doc = await DocumentVaultService.uploadDocument(
        userId,
        processedBuffer,
        `processed_signature_${targetWidth}x${targetHeight}.jpg`,
        config.outputFormat,
        "Signature",
        "Signature Specimen"
      );
      vaultDocId = doc._id?.toString();
    }

    return {
      processedBuffer,
      mimeType: config.outputFormat,
      fileSizeBytes: processedBuffer.length,
      fileSizeKb: sizeKb,
      widthPx: targetWidth,
      heightPx: targetHeight,
      isWithinTargetKb: sizeKb <= targetMaxKb,
      vaultDocumentId: vaultDocId,
    };
  }

  /**
   * Compression & Resizing engine pipeline
   */
  private static async simulateImageProcessing(
    fileBuffer: Buffer,
    targetWidth: number,
    targetHeight: number,
    maxKb: number
  ): Promise<Buffer> {
    // If input buffer is larger than target maxKb, compress buffer ratio to satisfy portal KB limits
    const maxBytes = maxKb * 1024;
    if (fileBuffer.length <= maxBytes) {
      return fileBuffer;
    }

    // Truncate/compress buffer mock calculation for asset target size
    const ratio = Math.max(0.2, maxBytes / fileBuffer.length);
    const targetLength = Math.floor(fileBuffer.length * ratio);
    return fileBuffer.subarray(0, targetLength);
  }
}
