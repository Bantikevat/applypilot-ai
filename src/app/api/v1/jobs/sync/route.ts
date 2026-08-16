import { NextResponse } from "next/server";
import { JobDiscoveryService } from "@/modules/m05-job-discovery/services/jobDiscoveryService";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { totalIngested } = await JobDiscoveryService.syncAllSources();

    return NextResponse.json({
      success: true,
      data: { totalIngested },
      message: `Successfully synchronized ${totalIngested} jobs from official sources & career portals`,
    });
  } catch (error) {
    console.error("Unhandled Job Sync Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to run job sync" } },
      { status: 500 }
    );
  }
}
