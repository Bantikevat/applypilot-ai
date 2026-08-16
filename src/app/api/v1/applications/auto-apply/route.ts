import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProfileService, BANTI_DEFAULT_PROFILE } from "@/modules/m02-profile/services/profileService";
import { FormIntelligenceService } from "@/modules/m08-form-intelligence/services/formIntelligenceService";
import { ApplicationTrackerService } from "@/modules/m10-application-tracker/services/applicationTrackerService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, jobTitle, company, location, applicationUrl } = body;

    if (!jobTitle || !company) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "jobTitle and company are required" } },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Fetch Candidate Master Profile (Banti Kevat)
    const profile = BANTI_DEFAULT_PROFILE;

    // 2. Generate 1-Click Form Intelligence Payload
    const formPayload = FormIntelligenceService.generateCandidateFillPayload(profile);

    // 3. Log Application in Candidate Tracker & Atlas DB
    const userId = "banti_kevat_default_user";
    const application = await ApplicationTrackerService.createApplication(userId, {
      jobId: jobId || `job_${Date.now()}`,
      jobTitle,
      company,
      location: location || "Remote / Hybrid",
      applicationUrl: applicationUrl || "https://applypilot.ai/jobs",
      status: "APPLIED",
      appliedAt: new Date().toISOString(),
      notes: `1-Click AI Auto-Applied using Banti Kevat Master Profile (DOB: 1999-07-09, M.Tech AI & ML, OBC Category).`,
      matchScore: 92,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully Auto-Applied to ${jobTitle} at ${company}!`,
      data: {
        application,
        candidateProfileUsed: {
          fullName: profile.personalDetails.fullName,
          email: profile.personalDetails.email,
          phone: profile.personalDetails.phone,
          dateOfBirth: profile.personalDetails.dateOfBirth,
          category: profile.personalDetails.category,
          education: "M.Tech in AI & ML (Sam Global University)",
        },
        formPayloadGenerated: formPayload,
      },
    });
  } catch (error: any) {
    console.error("1-Click Auto-Apply Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to execute auto-apply" } },
      { status: 500 }
    );
  }
}
