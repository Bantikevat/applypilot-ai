import { NextResponse } from "next/server";
import { FormIntelligenceService } from "@/modules/m08-form-intelligence/services/formIntelligenceService";
import { AppError } from "@/lib/errors/AppError";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "guest_user";
    const targetPortal = searchParams.get("targetPortal") || "Workday";

    const auditResult = await FormIntelligenceService.auditPortalReadiness(userId, targetPortal);

    return NextResponse.json({
      success: true,
      data: {
        auditResult,
      },
    });
  } catch (err: any) {
    console.error("Readiness Audit API Error:", err);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json({ success: false, error: err.message || "Failed to perform readiness audit." }, { status: statusCode });
  }
}
