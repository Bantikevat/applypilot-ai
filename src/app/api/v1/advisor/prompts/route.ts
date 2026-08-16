import { NextResponse } from "next/server";
import { CareerAgentService } from "@/modules/m12-career-agent/services/careerAgentService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chips = CareerAgentService.getRecommendedPromptChips();
    return NextResponse.json({
      success: true,
      data: { promptChips: chips },
    });
  } catch (error) {
    console.error("Unhandled Get Prompts Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch prompt chips" } },
      { status: 500 }
    );
  }
}
