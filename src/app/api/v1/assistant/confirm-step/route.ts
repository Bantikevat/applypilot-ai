import { NextResponse } from "next/server";
import { BrowserAssistantService } from "@/modules/m09-browser-assistant/services/browserAssistantService";
import { AppError } from "@/lib/errors/AppError";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, userId = "guest_user", modifiedFields, candidateApproved = true } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId parameter is required." },
        { status: 400 }
      );
    }

    const session = await BrowserAssistantService.confirmHumanStep(
      sessionId,
      userId,
      modifiedFields,
      candidateApproved
    );

    return NextResponse.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (err: any) {
    console.error("Confirm Assistant Step API Error:", err);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to confirm assistant step." },
      { status: statusCode }
    );
  }
}
