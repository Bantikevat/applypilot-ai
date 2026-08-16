import { NextResponse } from "next/server";
import { CareerAnalyticsService } from "@/modules/m11-career-analytics/services/careerAnalyticsService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId") || undefined;

    const benchmarks = CareerAnalyticsService.getSalaryBenchmarks(roleId);

    return NextResponse.json({
      success: true,
      data: { benchmarks },
    });
  } catch (error) {
    console.error("Unhandled Salary Trends Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch salary trends" } },
      { status: 500 }
    );
  }
}
