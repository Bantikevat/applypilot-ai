import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ZodError } from "zod";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { ProfileService } from "@/modules/m02-profile/services/profileService";
import { updateProfileSchema } from "@/modules/m02-profile/schemas/profileSchemas";
import { AppError } from "@/lib/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    let userId = "banti_kevat_default_user";

    if (token) {
      const payload = await AuthService.verifySessionToken(token);
      if (payload?.userId) {
        userId = payload.userId;
      }
    }

    const { profile, completeness } = await ProfileService.getProfileByUserId(userId);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        completeness,
      },
    });
  } catch (error) {
    console.error("Unhandled Profile GET Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch candidate profile" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    let userId = "banti_kevat_default_user";

    if (token) {
      const payload = await AuthService.verifySessionToken(token);
      if (payload?.userId) {
        userId = payload.userId;
      }
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const { profile, completeness } = await ProfileService.updateProfile(userId, validatedData);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        completeness,
      },
      message: "Master Career Profile updated successfully",
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message, details: error.details } },
        { status: error.statusCode }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed for profile updates",
            details: error.errors.map((e) => ({ field: e.path.join("."), issue: e.message })),
          },
        },
        { status: 400 }
      );
    }

    console.error("Unhandled Profile PUT Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to update profile" } },
      { status: 500 }
    );
  }
}
