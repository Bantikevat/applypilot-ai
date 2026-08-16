import { NextResponse } from "next/server";
import { JobDiscoveryService } from "@/modules/m05-job-discovery/services/jobDiscoveryService";
import { SocialJobIngestionService } from "@/modules/m05-job-discovery/services/socialJobIngestionService";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { totalIngested } = await JobDiscoveryService.syncAllSources();
    const socialJobs = await SocialJobIngestionService.syncSampleSocialFeeds();

    const grandTotal = totalIngested + socialJobs.length;

    return NextResponse.json({
      success: true,
      data: { totalIngested: grandTotal, socialJobsIngested: socialJobs.length },
      message: `Successfully synchronized ${grandTotal} jobs from official sources, WhatsApp groups & Telegram channels`,
    });
  } catch (error) {
    console.error("Unhandled Job Sync Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to run job sync" } },
      { status: 500 }
    );
  }
}
