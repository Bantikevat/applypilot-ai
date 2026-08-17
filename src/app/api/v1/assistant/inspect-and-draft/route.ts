import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { BANTI_DEFAULT_PROFILE } from "@/modules/m02-profile/services/profileService";
import { SocialJobIngestionService } from "@/modules/m05-job-discovery/services/socialJobIngestionService";
import { JobEligibilityService } from "@/modules/m07-job-matching/services/jobEligibilityService";
import { FormIntelligenceService } from "@/modules/m08-form-intelligence/services/formIntelligenceService";
import { ApplicationTrackerService } from "@/modules/m10-application-tracker/services/applicationTrackerService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messageText, groupName, source = "TELEGRAM" } = body;

    if (!messageText || messageText.length < 10) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Valid message text is required" } },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Parse Social Job Message (Extract Title, Company, Link, Salary, Location)
    const parsedJob = SocialJobIngestionService.parseSocialJobPost({
      source,
      groupName: groupName || "Telegram Job Alert Group",
      senderName: "Banti Channel Post",
      messageText,
    });

    if (!parsedJob) {
      return NextResponse.json(
        { success: false, error: { code: "PARSING_FAILED", message: "Could not extract job details from message" } },
        { status: 400 }
      );
    }

    // 2. Perform Deep Profile Eligibility Check for Banti Kevat
    const candidateProfile = BANTI_DEFAULT_PROFILE;
    const matchAudit = JobEligibilityService.evaluateEligibility(candidateProfile, parsedJob);

    // 3. Generate Candidate Auto-Fill Payload Draft
    const fillPayload = FormIntelligenceService.generateCandidateFillPayload(candidateProfile);

    // 4. Log Pending Draft in Application Tracker for Banti Approval
    const userId = "banti_kevat_default_user";
    const draftApplication = await ApplicationTrackerService.createApplication(userId, {
      jobId: parsedJob.externalJobId || `job_${Date.now()}`,
      jobTitle: parsedJob.title,
      company: parsedJob.company,
      location: parsedJob.location,
      applicationUrl: parsedJob.applicationUrl || parsedJob.sourceUrl || "https://applypilot.ai/jobs",
      status: "SAVED",
      appliedAt: new Date().toISOString(),
      notes: `Prepared Auto-Fill Draft for Banti Approval. Match Score: ${matchAudit.matchScore}%. Verdict: ${matchAudit.verdict}.`,
      matchScore: matchAudit.matchScore,
    });

    return NextResponse.json({
      success: true,
      message: `AI Inspected '${parsedJob.title}'! Draft prepared and waiting for Banti's approval.`,
      data: {
        applicationId: draftApplication._id,
        parsedJob: {
          title: parsedJob.title,
          company: parsedJob.company,
          location: parsedJob.location,
          applicationUrl: parsedJob.applicationUrl,
          workMode: parsedJob.workMode,
          description: parsedJob.description,
        },
        eligibility: {
          matchScore: matchAudit.matchScore,
          verdict: matchAudit.verdict,
          matchedSkills: matchAudit.matchedSkills,
          missingSkills: matchAudit.missingSkills,
          recommendation: matchAudit.recommendation,
        },
        draftFormFields: {
          fullName: candidateProfile.personalDetails.fullName,
          email: candidateProfile.personalDetails.email,
          phone: candidateProfile.personalDetails.phone,
          dateOfBirth: candidateProfile.personalDetails.dateOfBirth,
          category: candidateProfile.personalDetails.category,
          education: "M.Tech in AI & ML (Sam Global University)",
          experience: "MERN Stack Developer at Byteflow Tech & Nexan IT Tech",
        },
        status: "WAITING_FOR_USER_APPROVAL",
      },
    });
  } catch (error: any) {
    console.error("Inspect & Draft Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to inspect and draft application" } },
      { status: 500 }
    );
  }
}
