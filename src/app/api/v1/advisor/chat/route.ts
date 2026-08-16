import { NextResponse } from "next/server";
import { CareerAgentService } from "@/modules/m12-career-agent/services/careerAgentService";
import { AppError } from "@/lib/errors/AppError";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId = "guest_user", prompt, topic = "GENERAL_CAREER" } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "prompt parameter is required." },
        { status: 400 }
      );
    }

    const response = await CareerAgentService.processCareerPrompt(userId, prompt, topic);

    return NextResponse.json({
      success: true,
      data: {
        response,
      },
    });
  } catch (err: any) {
    console.error("Career Advisor Chat API Error:", err);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process advisor prompt." },
      { status: statusCode }
    );
  }
}
