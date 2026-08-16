import { ApplicationTrackerService } from "@/modules/m10-application-tracker/services/applicationTrackerService";
import { ProfileService } from "@/modules/m02-profile/services/profileService";

export interface FunnelStep {
  stage: string;
  count: number;
  conversionRatePercentage: number;
}

export interface PortalPerformance {
  category: "Government" | "Corporate" | "Remote";
  totalApplied: number;
  callbacksReceived: number;
  responseRatePercentage: number;
}

export interface SalaryBenchmark {
  roleId: string;
  roleTitle: string;
  minLpa: number;
  medianLpa: number;
  maxLpa: number;
  demandIndex: "VERY_HIGH" | "HIGH" | "MODERATE";
}

export interface CareerAnalyticsOverview {
  profileCompletenessScore: number;
  totalApplicationsLogged: number;
  overallInterviewConversionRate: number;
  averageResponseTimeDays: number;
  weeklyApplicationVelocity: number;
  conversionFunnel: FunnelStep[];
  portalPerformance: PortalPerformance[];
  topSalaryBenchmarks: SalaryBenchmark[];
}

export const SALARY_BENCHMARKS: Record<string, SalaryBenchmark> = {
  "fullstack-ai": {
    roleId: "fullstack-ai",
    roleTitle: "Fullstack AI Engineer",
    minLpa: 12,
    medianLpa: 24,
    maxLpa: 45,
    demandIndex: "VERY_HIGH",
  },
  "frontend-lead": {
    roleId: "frontend-lead",
    roleTitle: "Frontend Lead / Architect",
    minLpa: 15,
    medianLpa: 28,
    maxLpa: 50,
    demandIndex: "HIGH",
  },
  "govt-aso": {
    roleId: "govt-aso",
    roleTitle: "Government Assistant Section Officer (ASO)",
    minLpa: 7,
    medianLpa: 9.5,
    maxLpa: 12,
    demandIndex: "HIGH",
  },
  "generic": {
    roleId: "generic",
    roleTitle: "Software Development Engineer",
    minLpa: 8,
    medianLpa: 16,
    maxLpa: 35,
    demandIndex: "HIGH",
  },
};

export class CareerAnalyticsService {
  /**
   * Aggregates complete career analytics overview payload for candidate
   */
  static async getAnalyticsOverview(userId: string): Promise<CareerAnalyticsOverview> {
    const { applications, metrics } = await ApplicationTrackerService.getUserApplications(userId);
    const { completeness } = await ProfileService.getProfileByUserId(userId);

    const total = applications.length;

    // Conversion Funnel calculation
    const applied = applications.filter((a) => a.status !== "SAVED").length;
    const underReview = applications.filter((a) => a.status === "UNDER_REVIEW" || a.status === "SHORTLISTED").length;
    const interview = applications.filter((a) => a.status === "INTERVIEW_SCHEDULED").length;
    const offer = applications.filter((a) => a.status === "OFFER_RECEIVED").length;

    const conversionFunnel: FunnelStep[] = [
      { stage: "Applications Submitted", count: applied, conversionRatePercentage: 100 },
      { stage: "Under Review / Screening", count: underReview, conversionRatePercentage: applied > 0 ? Math.round((underReview / applied) * 100) : 0 },
      { stage: "Interview Scheduled", count: interview, conversionRatePercentage: applied > 0 ? Math.round((interview / applied) * 100) : 0 },
      { stage: "Offer Received", count: offer, conversionRatePercentage: applied > 0 ? Math.round((offer / applied) * 100) : 0 },
    ];

    // Portal Performance Breakdown
    const corporateApps = applications.filter((a) => a.portalCategory === "Corporate");
    const govtApps = applications.filter((a) => a.portalCategory === "Government");
    const remoteApps = applications.filter((a) => a.portalCategory === "Remote");

    const portalPerformance: PortalPerformance[] = [
      {
        category: "Corporate",
        totalApplied: corporateApps.length,
        callbacksReceived: corporateApps.filter((a) => a.status === "INTERVIEW_SCHEDULED" || a.status === "OFFER_RECEIVED").length,
        responseRatePercentage: corporateApps.length > 0 ? Math.round(((corporateApps.filter((a) => a.status === "INTERVIEW_SCHEDULED" || a.status === "OFFER_RECEIVED").length) / corporateApps.length) * 100) : 0,
      },
      {
        category: "Government",
        totalApplied: govtApps.length,
        callbacksReceived: govtApps.filter((a) => a.status === "INTERVIEW_SCHEDULED" || a.status === "OFFER_RECEIVED").length,
        responseRatePercentage: govtApps.length > 0 ? Math.round(((govtApps.filter((a) => a.status === "INTERVIEW_SCHEDULED" || a.status === "OFFER_RECEIVED").length) / govtApps.length) * 100) : 0,
      },
      {
        category: "Remote",
        totalApplied: remoteApps.length,
        callbacksReceived: remoteApps.filter((a) => a.status === "INTERVIEW_SCHEDULED" || a.status === "OFFER_RECEIVED").length,
        responseRatePercentage: remoteApps.length > 0 ? Math.round(((remoteApps.filter((a) => a.status === "INTERVIEW_SCHEDULED" || a.status === "OFFER_RECEIVED").length) / remoteApps.length) * 100) : 0,
      },
    ];

    const interviewConversion = applied > 0 ? Math.round((interview / applied) * 100) : 0;
    const velocity = Math.max(1, Math.round(total / 4)); // Estimated weekly velocity

    return {
      profileCompletenessScore: completeness.score,
      totalApplicationsLogged: total,
      overallInterviewConversionRate: interviewConversion,
      averageResponseTimeDays: 7, // Benchmark average
      weeklyApplicationVelocity: velocity,
      conversionFunnel,
      portalPerformance,
      topSalaryBenchmarks: Object.values(SALARY_BENCHMARKS),
    };
  }

  /**
   * Retrieves salary benchmark ranges for target roles
   */
  static getSalaryBenchmarks(roleId?: string): SalaryBenchmark[] {
    if (roleId && SALARY_BENCHMARKS[roleId]) {
      return [SALARY_BENCHMARKS[roleId]];
    }
    return Object.values(SALARY_BENCHMARKS);
  }
}
