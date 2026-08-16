import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "No active session cookie found",
          },
        },
        { status: 401 }
      );
    }

    const payload = await AuthService.verifySessionToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Session token is invalid or expired",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: payload.userId,
          email: payload.email,
          fullName: payload.fullName,
          role: payload.role,
        },
      },
    });
  } catch (error) {
    console.error("Unhandled Auth Me Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve authenticated session context.",
        },
      },
      { status: 500 }
    );
  }
}
