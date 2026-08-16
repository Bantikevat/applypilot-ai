import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { BrowserAssistantService } from "@/modules/m09-browser-assistant/services/browserAssistantService";
import { startAssistantSessionSchema } from "@/modules/m09-browser-assistant/schemas/assistantSchemas";
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
    const { targetPortalUrl, portalName, jobId } = startAssistantSessionSchema.parse(body);

    const session = await BrowserAssistantService.startSession(payload.userId, targetPortalUrl, portalName, jobId);

    return NextResponse.json({
      success: true,
      data: { session },
      message: "Browser Assistant Session initiated. Awaiting candidate HITL review.",
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Start Assistant Session Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to start assistant session" } },
      { status: 500 }
    );
  }
}
