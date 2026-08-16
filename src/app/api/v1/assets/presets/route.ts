import { NextResponse } from "next/server";
import { AssetEngineService } from "@/modules/m04-asset-engine/services/assetEngineService";

export const dynamic = "force-dynamic";

export async function GET() {
  const presets = AssetEngineService.getPortalPresets();
  return NextResponse.json({
    success: true,
    data: { presets },
  });
}
