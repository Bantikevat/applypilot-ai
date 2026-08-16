import { ROLE_BENCHMARKS, RoleBenchmark, SkillBenchmarkItem } from "../benchmarks/roleBenchmarks";
import { ProfileService } from "@/modules/m02-profile/services/profileService";
import { JobDiscoveryService } from "@/modules/m05-job-discovery/services/jobDiscoveryService";
import { NotFoundError } from "@/lib/errors/AppError";

export interface SkillGapItem {
  skillName: string;
  category: string;
  status: "MASTERED" | "CRITICAL_GAP" | "RECOMMENDED";
  candidateProficiency?: string;
  requiredProficiency: string;
  estimatedDaysToMaster: number;
  learningResourceUrl: string;
  learningResourceTitle: string;
}

export interface SkillGapAnalysisResult {
  roleId: string;
  roleTitle: string;
  category: string;
  skillMasteryPercentage: number;
  masteredCount: number;
  totalRequiredCount: number;
  estimatedTotalDays: number;
  masteredSkills: SkillGapItem[];
  criticalGaps: SkillGapItem[];
  recommendedGaps: SkillGapItem[];
}

export class SkillGapService {
  /**
   * Retrieves list of supported target role benchmarks
   */
  static getRoleBenchmarks(): Record<string, RoleBenchmark> {
    return ROLE_BENCHMARKS;
  }

  /**
   * Analyzes candidate skills against a target role benchmark
   */
  static analyzeSkillGap(candidateProfile: any, roleId: string): SkillGapAnalysisResult {
    const roleBenchmark = ROLE_BENCHMARKS[roleId];
    if (!roleBenchmark) {
      throw new NotFoundError(`Target role benchmark '${roleId}' not found.`);
    }

    const profileData = candidateProfile?.profile || candidateProfile || {};
    const candidateSkillsMap = new Map<string, string>();
    const rawSkills = Array.isArray(profileData?.skills)
      ? profileData.skills
      : profileData?.skills?.technicalSkills || [];

    for (const s of rawSkills) {
      const name = (typeof s === "string" ? s : s.skillName || "").toLowerCase().trim();
      const prof = (typeof s === "object" ? s.proficiency : "INTERMEDIATE") || "INTERMEDIATE";
      candidateSkillsMap.set(name, prof);
    }

    const masteredSkills: SkillGapItem[] = [];
    const criticalGaps: SkillGapItem[] = [];
    const recommendedGaps: SkillGapItem[] = [];
    let totalDays = 0;

    for (const bench of roleBenchmark.skills) {
      const bNameLower = bench.skillName.toLowerCase().trim();
      const candidateProf = candidateSkillsMap.get(bNameLower);

      if (candidateProf) {
        masteredSkills.push({
          skillName: bench.skillName,
          category: bench.category,
          status: "MASTERED",
          candidateProficiency: candidateProf,
          requiredProficiency: bench.minProficiency,
          estimatedDaysToMaster: 0,
          learningResourceUrl: bench.learningResourceUrl,
          learningResourceTitle: bench.learningResourceTitle,
        });
      } else {
        totalDays += bench.estimatedDaysToMaster;
        const gapItem: SkillGapItem = {
          skillName: bench.skillName,
          category: bench.category,
          status: bench.importance === "CRITICAL" ? "CRITICAL_GAP" : "RECOMMENDED",
          requiredProficiency: bench.minProficiency,
          estimatedDaysToMaster: bench.estimatedDaysToMaster,
          learningResourceUrl: bench.learningResourceUrl,
          learningResourceTitle: bench.learningResourceTitle,
        };

        if (bench.importance === "CRITICAL") {
          criticalGaps.push(gapItem);
        } else {
          recommendedGaps.push(gapItem);
        }
      }
    }

    const totalRequired = roleBenchmark.skills.length;
    const masteryPercentage = Math.round((masteredSkills.length / (totalRequired || 1)) * 100);

    return {
      roleId: roleBenchmark.id,
      roleTitle: roleBenchmark.roleTitle,
      category: roleBenchmark.category,
      skillMasteryPercentage: masteryPercentage,
      masteredCount: masteredSkills.length,
      totalRequiredCount: totalRequired,
      estimatedTotalDays: totalDays,
      masteredSkills,
      criticalGaps,
      recommendedGaps,
    };
  }

  /**
   * Analyzes candidate skills against ANY dynamic job vacancy from M05 Discovery feeds
   */
  static async analyzeJobVacancySkillGap(userId: string, jobId: string): Promise<SkillGapAnalysisResult> {
    const profile = await ProfileService.getProfileByUserId(userId);
    const job = await JobDiscoveryService.getJobById(jobId);

    if (!job || (!job._id && !(job as any).id)) {
      throw new NotFoundError(`Requested job vacancy '${jobId}' not found for skill gap analysis.`);
    }

    const jobSkills: string[] = (job as any).skills || [];
    const profileData = profile?.profile || profile || {};
    const candidateSkillsMap = new Map<string, string>();
    const rawSkills = Array.isArray(profileData?.skills)
      ? profileData.skills
      : profileData?.skills?.technicalSkills || [];

    for (const s of rawSkills) {
      const name = (typeof s === "string" ? s : s.skillName || "").toLowerCase().trim();
      const prof = (typeof s === "object" ? s.proficiency : "INTERMEDIATE") || "INTERMEDIATE";
      candidateSkillsMap.set(name, prof);
    }

    const masteredSkills: SkillGapItem[] = [];
    const criticalGaps: SkillGapItem[] = [];
    const recommendedGaps: SkillGapItem[] = [];
    let totalDays = 0;

    for (const js of jobSkills) {
      const jsLower = js.toLowerCase().trim();
      const candidateProf = candidateSkillsMap.get(jsLower);

      if (candidateProf) {
        masteredSkills.push({
          skillName: js,
          category: "Technical",
          status: "MASTERED",
          candidateProficiency: candidateProf,
          requiredProficiency: "INTERMEDIATE",
          estimatedDaysToMaster: 0,
          learningResourceUrl: `https://www.google.com/search?q=${encodeURIComponent(js + " tutorial documentation")}`,
          learningResourceTitle: `${js} Documentation & Guide`,
        });
      } else {
        const estDays = 5;
        totalDays += estDays;
        const gapItem: SkillGapItem = {
          skillName: js,
          category: "Technical",
          status: "CRITICAL_GAP",
          requiredProficiency: "INTERMEDIATE",
          estimatedDaysToMaster: estDays,
          learningResourceUrl: `https://www.google.com/search?q=${encodeURIComponent(js + " tutorial documentation")}`,
          learningResourceTitle: `${js} Documentation & Guide`,
        };
        criticalGaps.push(gapItem);
      }
    }

    const totalRequired = jobSkills.length;
    const masteryPercentage = totalRequired > 0 ? Math.round((masteredSkills.length / totalRequired) * 100) : 100;

    return {
      roleId: (job as any)._id?.toString() || (job as any).id || jobId,
      roleTitle: (job as any).title || "Target Job Vacancy",
      category: (job as any).company || "Vacancy Analysis",
      skillMasteryPercentage: masteryPercentage,
      masteredCount: masteredSkills.length,
      totalRequiredCount: totalRequired,
      estimatedTotalDays: totalDays,
      masteredSkills,
      criticalGaps,
      recommendedGaps,
    };
  }

  /**
   * One-click appends a newly acquired skill to candidate's M02 Master Career Profile
   */
  static async addSkillToProfile(userId: string, skillName: string, proficiency: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT") {
    const { profile } = await ProfileService.getProfileByUserId(userId);
    const currentTechSkills = profile?.skills?.technicalSkills || [];

    const isDuplicate = currentTechSkills.some(
      (s: any) => (s.skillName || "").toLowerCase().trim() === skillName.toLowerCase().trim()
    );

    if (!isDuplicate) {
      const updatedTechSkills = [...currentTechSkills, { skillName, proficiency }];
      await ProfileService.updateProfile(userId, {
        skills: {
          ...profile?.skills,
          technicalSkills: updatedTechSkills,
        },
      });
    }

    return { success: true, message: `'${skillName}' added to Master Profile successfully!` };
  }
}
