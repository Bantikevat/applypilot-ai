import { NextResponse } from "next/server";
import { JobDiscoveryService } from "@/modules/m05-job-discovery/services/jobDiscoveryService";
import { jobSearchQuerySchema } from "@/modules/m05-job-discovery/schemas/jobSchemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const rawCategory = searchParams.get("sourceCategory") || "All";

    const rawParams = {
      q: searchParams.get("q") || undefined,
      location: searchParams.get("location") || undefined,
      sourceCategory: rawCategory,
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 12),
    };

    const query = jobSearchQuerySchema.parse(rawParams);

    const { jobs, total } = await JobDiscoveryService.searchJobs(query);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        total,
        page: query.page,
        limit: query.limit,
      },
    });
  } catch (error) {
    console.error("Unhandled Job Search Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch job postings" } },
      { status: 500 }
    );
  }
}
