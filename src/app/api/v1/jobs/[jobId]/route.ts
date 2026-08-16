import { NextResponse } from "next/server";
import { JobDiscoveryService } from "@/modules/m05-job-discovery/services/jobDiscoveryService";
import { AppError } from "@/lib/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { jobId: string } }) {
  try {
    const job = await JobDiscoveryService.getJobById(params.jobId);
    return NextResponse.json({
      success: true,
      data: { job },
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Job Detail Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch job detail" } },
      { status: 500 }
    );
  }
}
