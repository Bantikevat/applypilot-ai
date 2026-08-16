import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { ProfileService } from "@/modules/m02-profile/services/profileService";
import { SkillGapService } from "@/modules/m07-skill-gap/services/skillGapService";
import { analyzeSkillGapSchema } from "@/modules/m07-skill-gap/schemas/skillGapSchemas";
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
    const { roleId } = analyzeSkillGapSchema.parse(body);

    const profile = await ProfileService.getProfileByUserId(payload.userId);
    const result = SkillGapService.analyzeSkillGap(profile, roleId);

    return NextResponse.json({
      success: true,
      data: { analysis: result },
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Skill Gap Analysis Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to analyze skill gap" } },
      { status: 500 }
    );
  }
}
