import { NextResponse } from "next/server";
import { CareerAgentService } from "@/modules/m12-career-agent/services/careerAgentService";

export async function GET() {
  try {
    const chips = CareerAgentService.getRecommendedPromptChips();
    return NextResponse.json({
      success: true,
      data: {
        chips,
      },
    });
  } catch (err: any) {
    console.error("Advisor Prompt Chips API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve prompt chips." },
      { status: 500 }
    );
  }
}
