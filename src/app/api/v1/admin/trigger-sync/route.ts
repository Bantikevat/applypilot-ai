import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { AdminConsoleService } from "@/modules/m14-admin-console/services/adminConsoleService";
import { triggerSyncSchema } from "@/modules/m14-admin-console/schemas/adminSchemas";
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

    const body = await request.json().catch(() => ({}));
    const { adapterId } = triggerSyncSchema.parse(body);

    const result = await AdminConsoleService.triggerAdapterSync(adapterId);

    return NextResponse.json({
      success: true,
      data: { syncResult: result },
      message: result.message,
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Trigger Sync Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to trigger scraper sync" } },
      { status: 500 }
    );
  }
}
