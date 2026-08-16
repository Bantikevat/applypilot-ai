import { NextResponse } from "next/server";
import { FormIntelligenceService } from "@/modules/m08-form-intelligence/services/formIntelligenceService";
import { AppError } from "@/lib/errors/AppError";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId = "guest_user", targetPortal = "Workday", formFields = [] } = body;

    if (!Array.isArray(formFields) || formFields.length === 0) {
      return NextResponse.json({ success: false, error: "formFields array parameter is required." }, { status: 400 });
    }

    const planResult = await FormIntelligenceService.generatePreFillPlan(userId, targetPortal, formFields);

    return NextResponse.json({
      success: true,
      data: {
        planResult,
      },
    });
  } catch (err: any) {
    console.error("Pre-fill Plan API Error:", err);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json({ success: false, error: err.message || "Failed to generate pre-fill plan." }, { status: statusCode });
  }
}
