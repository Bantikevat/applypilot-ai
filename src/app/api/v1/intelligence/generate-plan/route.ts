import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { FormIntelligenceService } from "@/modules/m08-form-intelligence/services/formIntelligenceService";
import { generatePlanRequestSchema } from "@/modules/m08-form-intelligence/schemas/formSchemas";
import { AppError } from "@/lib/errors/AppError";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const payload = await AuthService.verifySessionToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session token" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetPortal, fields } = generatePlanRequestSchema.parse(body);

    const planResult = await FormIntelligenceService.generatePreFillPlan(payload.userId, targetPortal, fields);

    return NextResponse.json({
      success: true,
      data: { preFillPlan: planResult },
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Pre-fill Plan Generation Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to generate form pre-fill plan" } },
      { status: 500 }
    );
  }
}
