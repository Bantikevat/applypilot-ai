import { NextResponse } from "next/server";
import { SkillGapService } from "@/modules/m07-skill-gap/services/skillGapService";

export const dynamic = "force-dynamic";

export async function GET() {
  const benchmarks = SkillGapService.getRoleBenchmarks();
  return NextResponse.json({
    success: true,
    data: { benchmarks },
  });
}
