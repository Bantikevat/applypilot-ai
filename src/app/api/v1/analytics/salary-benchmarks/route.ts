import { NextResponse } from "next/server";
import { CareerAnalyticsService } from "@/modules/m11-career-analytics/services/careerAnalyticsService";
import { AppError } from "@/lib/errors/AppError";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("roleId") || undefined;

    const benchmarks = CareerAnalyticsService.getSalaryBenchmarks(roleId);

    return NextResponse.json({
      success: true,
      data: {
        benchmarks,
      },
    });
  } catch (err: any) {
    console.error("Salary Benchmarks API Error:", err);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve salary benchmarks." },
      { status: statusCode }
    );
  }
}
