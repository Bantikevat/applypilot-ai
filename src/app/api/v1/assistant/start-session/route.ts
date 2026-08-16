import { NextResponse } from "next/server";
import { BrowserAssistantService } from "@/modules/m09-browser-assistant/services/browserAssistantService";
import { AppError } from "@/lib/errors/AppError";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId = "guest_user", targetPortalUrl, portalName, jobId, formFields } = body;

    if (!targetPortalUrl || !portalName) {
      return NextResponse.json(
        { success: false, error: "targetPortalUrl and portalName parameters are required." },
        { status: 400 }
      );
    }

    const session = await BrowserAssistantService.startSession(
      userId,
      targetPortalUrl,
      portalName,
      jobId,
      formFields
    );

    return NextResponse.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (err: any) {
    console.error("Start Assistant Session API Error:", err);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to start assistant session." },
      { status: statusCode }
    );
  }
}
