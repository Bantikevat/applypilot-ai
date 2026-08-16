import { ROLE_BENCHMARKS, RoleBenchmark, SkillBenchmarkItem } from "../benchmarks/roleBenchmarks";
import { ProfileService } from "@/modules/m02-profile/services/profileService";
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

    const candidateSkillsMap = new Map<string, string>();
    const rawSkills = Array.isArray(candidateProfile?.skills)
      ? candidateProfile.skills
      : candidateProfile?.skills?.technicalSkills || [];

    for (const s of rawSkills) {
      const name = (s.skillName || s || "").toLowerCase().trim();
      const prof = s.proficiency || "INTERMEDIATE";
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
