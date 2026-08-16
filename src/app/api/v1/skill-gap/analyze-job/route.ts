import { NextResponse } from "next/server";
import { SkillGapService } from "@/modules/m07-skill-gap/services/skillGapService";
import { AppError } from "@/lib/errors/AppError";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, userId = "guest_user" } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: "jobId parameter is required." }, { status: 400 });
    }

    const analysis = await SkillGapService.analyzeJobVacancySkillGap(userId, jobId);

    return NextResponse.json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (err: any) {
    console.error("Skill Gap Job Analysis API Error:", err);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json({ success: false, error: err.message || "Failed to analyze job skill gap." }, { status: statusCode });
  }
}
