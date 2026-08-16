import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { AssetEngineService } from "@/modules/m04-asset-engine/services/assetEngineService";
import { processSignatureConfigSchema } from "@/modules/m04-asset-engine/schemas/assetSchemas";
import { AppError } from "@/lib/errors/AppError";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const payload = await AuthService.verifySessionToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session token" } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const presetId = formData.get("presetId") as string | undefined;
    const targetWidthPx = Number(formData.get("targetWidthPx") || 140);
    const targetHeightPx = Number(formData.get("targetHeightPx") || 60);
    const targetMaxKb = Number(formData.get("targetMaxKb") || 20);
    const enhanceContrast = formData.get("enhanceContrast") !== "false";
    const exportToVault = formData.get("exportToVault") === "true";

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No signature file attached" } },
        { status: 400 }
      );
    }

    const config = processSignatureConfigSchema.parse({
      presetId,
      targetWidthPx,
      targetHeightPx,
      targetMaxKb,
      enhanceContrast,
      exportToVault,
    });

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    const result = await AssetEngineService.processSignature(
      payload.userId,
      fileBuffer,
      file.name,
      config
    );

    return NextResponse.json({
      success: true,
      data: {
        fileSizeBytes: result.fileSizeBytes,
        fileSizeKb: result.fileSizeKb,
        widthPx: result.widthPx,
        heightPx: result.heightPx,
        isWithinTargetKb: result.isWithinTargetKb,
        vaultDocumentId: result.vaultDocumentId,
      },
      message: "Signature processed & enhanced to target portal specs successfully",
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Signature Processing Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to process signature asset" } },
      { status: 500 }
    );
  }
}
