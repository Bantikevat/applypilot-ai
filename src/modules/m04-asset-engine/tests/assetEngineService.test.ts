import { describe, it, expect } from "vitest";
import { processPhotoConfigSchema, processSignatureConfigSchema } from "../schemas/assetSchemas";
import { PORTAL_PRESETS } from "../presets/portalPresets";
import { AssetEngineService } from "../services/assetEngineService";

describe("M04 — Photo / Signature / Asset Engine Tests", () => {
  it("should validate photo config schema correctly", () => {
    const validConfig = {
      presetId: "ssc",
      targetWidthPx: 350,
      targetHeightPx: 450,
      targetMaxKb: 50,
      exportToVault: true,
    };

    const res = processPhotoConfigSchema.safeParse(validConfig);
    expect(res.success).toBe(true);
  });

  it("should validate signature config schema correctly", () => {
    const validConfig = {
      presetId: "ibps",
      targetWidthPx: 140,
      targetHeightPx: 60,
      targetMaxKb: 20,
      enhanceContrast: true,
      exportToVault: false,
    };

    const res = processSignatureConfigSchema.safeParse(validConfig);
    expect(res.success).toBe(true);
  });

  it("should return valid recruitment portal presets (SSC, UPSC, IBPS, Standard)", () => {
    const presets = AssetEngineService.getPortalPresets();

    expect(presets.ssc).toBeDefined();
    expect(presets.ssc.photo.maxSizeKb).toBe(50);

    expect(presets.upsc).toBeDefined();
    expect(presets.upsc.photo.targetWidthPx).toBe(350);

    expect(presets.ibps).toBeDefined();
    expect(presets.ibps.signature.maxSizeKb).toBe(20);
  });

  it("should process and compress photo asset to target dimensions and KB limits", async () => {
    const userId = "test_asset_user_123";
    const sampleBuffer = Buffer.alloc(100 * 1024); // 100KB sample image

    const result = await AssetEngineService.processPhoto(
      userId,
      sampleBuffer,
      "my_passport_photo.jpg",
      {
        presetId: "ssc",
        targetWidthPx: 350,
        targetHeightPx: 450,
        targetMaxKb: 50,
        outputFormat: "image/jpeg",
        quality: 85,
        exportToVault: false,
      }
    );

    expect(result).toBeDefined();
    expect(result.widthPx).toBe(350);
    expect(result.heightPx).toBe(450);
    expect(result.fileSizeKb).toBeLessThanOrEqual(50);
    expect(result.isWithinTargetKb).toBe(true);
  });
});
