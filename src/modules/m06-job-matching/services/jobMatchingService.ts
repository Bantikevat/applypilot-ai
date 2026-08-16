import { ProfileService } from "@/modules/m02-profile/services/profileService";
import { JobDiscoveryService } from "@/modules/m05-job-discovery/services/jobDiscoveryService";
import { EligibilityVerdict } from "../schemas/matchingSchemas";
import { NotFoundError } from "@/lib/errors/AppError";

export interface CriteriaFactorResult {
  factor: "Education" | "Age" | "Experience" | "Skills" | "Location";
  passed: boolean;
  score: number;
  maxScore: number;
  reason: string;
}

export interface JobMatchResult {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  matchScore: number;
  eligibilityVerdict: EligibilityVerdict;
  factors: CriteriaFactorResult[];
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

export class JobMatchingService {
  /**
   * Calculates candidate age from Date of Birth string
   */
  static calculateAge(dateOfBirth?: string): number | null {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;

    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  /**
   * Calculates total candidate experience in years from experience records
   */
  static calculateTotalExperienceYears(experienceRecords: any[] = []): number {
    let totalMonths = 0;
    for (const exp of experienceRecords) {
      if (!exp.startDate) continue;
      const start = new Date(exp.startDate);
      const end = exp.isCurrentRole || exp.isCurrent || !exp.endDate ? new Date() : new Date(exp.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    }
    return parseFloat((totalMonths / 12).toFixed(1));
  }

  /**
   * Evaluates candidate profile against job criteria across 5 key dimensions
   */
  static evaluateMatch(rawCandidateProfile: any, job: any): JobMatchResult {
    if (!job) {
      throw new NotFoundError("Requested job vacancy not found for match evaluation.");
    }

    const candidateProfile = rawCandidateProfile?.profile || rawCandidateProfile || {};
    const factors: CriteriaFactorResult[] = [];
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    // 1. Education Factor Evaluation (Weight: 25)
    let eduScore = 25;
    let eduPassed = true;
    let eduReason = "Educational criteria satisfied.";

    const candidateEducation = candidateProfile?.education || [];
    const requiredEducation = job.educationRequirements || [];

    if (requiredEducation.length > 0) {
      if (candidateEducation.length === 0) {
        eduPassed = false;
        eduScore = 5;
        eduReason = "Candidate has no education history recorded on file.";
      } else {
        const candidateDegreeTitles = candidateEducation.map((e: any) => (e.degree || e.level || "").toLowerCase());
        
        const matchesRequired = requiredEducation.some((reqStr: string) => {
          const reqLower = reqStr.toLowerCase();
          return candidateDegreeTitles.some((candidateDegree: string) => {
            if (candidateDegree.includes(reqLower) || reqLower.includes(candidateDegree)) {
              return true;
            }
            // Degree equivalence rules
            if (reqLower.includes("bachelor") || reqLower.includes("b.tech") || reqLower.includes("b.e.") || reqLower.includes("graduation")) {
              return (
                candidateDegree.includes("b.tech") ||
                candidateDegree.includes("b.e.") ||
                candidateDegree.includes("bca") ||
                candidateDegree.includes("b.sc") ||
                candidateDegree.includes("bachelor") ||
                candidateDegree.includes("graduation")
              );
            }
            if (reqLower.includes("master") || reqLower.includes("m.tech") || reqLower.includes("m.e.") || reqLower.includes("post graduation")) {
              return (
                candidateDegree.includes("m.tech") ||
                candidateDegree.includes("m.e.") ||
                candidateDegree.includes("mca") ||
                candidateDegree.includes("m.sc") ||
                candidateDegree.includes("master") ||
                candidateDegree.includes("post graduation")
              );
            }
            return false;
          });
        });

        if (!matchesRequired) {
          eduPassed = false;
          eduScore = 5;
          eduReason = `Candidate degrees (${candidateDegreeTitles.join(", ")}) do not match required degree (${requiredEducation.join(", ")}).`;
        }
      }
    }
    factors.push({ factor: "Education", passed: eduPassed, score: eduScore, maxScore: 25, reason: eduReason });

    // 2. Age Factor Evaluation (Weight: 15)
    let ageScore = 15;
    let agePassed = true;
    let ageReason = "Candidate age is within acceptable bounds.";

    const candidateDob = candidateProfile?.personal?.dateOfBirth || candidateProfile?.personalInfo?.dateOfBirth;
    const candidateAge = this.calculateAge(candidateDob);

    if (job.employmentType === "Government") {
      if (candidateAge !== null) {
        const candidateCategory = candidateProfile?.personal?.category || candidateProfile?.personalInfo?.category || "General";
        let maxGovtAge = 32;
        if (candidateCategory === "OBC") maxGovtAge = 35;
        if (candidateCategory === "SC" || candidateCategory === "ST") maxGovtAge = 37;

        if (candidateAge < 20 || candidateAge > maxGovtAge) {
          agePassed = false;
          ageScore = 0;
          ageReason = `Candidate age (${candidateAge} yrs, ${candidateCategory}) falls outside government age limit (20-${maxGovtAge} yrs).`;
        }
      }
    }
    factors.push({ factor: "Age", passed: agePassed, score: ageScore, maxScore: 15, reason: ageReason });

    // 3. Experience Factor Evaluation (Weight: 25)
    let expScore = 25;
    let expPassed = true;
    let expReason = "Experience threshold met.";

    const candidateExpYears = this.calculateTotalExperienceYears(candidateProfile?.experience);
    const minExpRequired = job.minExperienceYears || 0;

    if (candidateExpYears < minExpRequired) {
      expPassed = false;
      const ratio = minExpRequired > 0 ? candidateExpYears / minExpRequired : 1;
      expScore = Math.floor(25 * ratio);
      expReason = `Candidate has ${candidateExpYears} yrs experience (Job requires min ${minExpRequired} yrs).`;
    }
    factors.push({ factor: "Experience", passed: expPassed, score: expScore, maxScore: 25, reason: expReason });

    // 4. Skills Match Evaluation (Weight: 25) - Word Boundary Match Engine
    let skillScore = 25;
    const rawSkills = candidateProfile?.skills?.technicalSkills || candidateProfile?.skills || [];
    const candidateSkillList = (Array.isArray(rawSkills) ? rawSkills : []).map((s: any) => (typeof s === "string" ? s : s.skillName || "").toLowerCase());
    const jobSkills = job.skills || [];

    if (jobSkills.length > 0) {
      for (const js of jobSkills) {
        const jsLower = js.toLowerCase();
        
        // Exact or word boundary match to prevent "Java" matching "JavaScript" or "C" matching "C++"
        const isMatched = candidateSkillList.some((cs: string) => {
          if (cs === jsLower) return true;
          // Word boundary check for distinct skill tokens
          const escapedJs = jsLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`\\b${escapedJs}\\b`, "i");
          return regex.test(cs);
        });

        if (isMatched) {
          matchedSkills.push(js);
        } else {
          missingSkills.push(js);
        }
      }

      const matchRatio = matchedSkills.length / jobSkills.length;
      skillScore = Math.round(25 * matchRatio);
    }
    factors.push({
      factor: "Skills",
      passed: matchedSkills.length > 0 || jobSkills.length === 0,
      score: skillScore,
      maxScore: 25,
      reason: `Matched ${matchedSkills.length} of ${jobSkills.length} required skills.`,
    });

    // 5. Location Match Evaluation (Weight: 10)
    let locScore = 10;
    let locPassed = true;
    let locReason = "Location preference compatible.";

    const candidateCity = (candidateProfile?.personal?.city || candidateProfile?.personalInfo?.city || "").toLowerCase();
    const jobLocation = (job.location || "").toLowerCase();

    if (jobLocation.includes("remote") || candidateCity === "" || jobLocation.includes(candidateCity)) {
      locScore = 10;
    } else {
      locScore = 6;
      locReason = `Job is located in '${job.location}' while candidate is based in '${candidateProfile?.personal?.city || candidateProfile?.personalInfo?.city || "Unknown"}'.`;
    }
    factors.push({ factor: "Location", passed: locPassed, score: locScore, maxScore: 10, reason: locReason });

    // Total Score & Verdict
    const totalMatchScore = factors.reduce((sum, f) => sum + f.score, 0);

    let verdict: EligibilityVerdict = "INELIGIBLE";
    if (totalMatchScore >= 80 && agePassed && eduPassed) {
      verdict = "ELIGIBLE";
    } else if (totalMatchScore >= 50 && agePassed) {
      verdict = "PARTIALLY_ELIGIBLE";
    }

    let recommendation = "Strong candidate profile fit! High probability of selection.";
    if (verdict === "PARTIALLY_ELIGIBLE") {
      recommendation = `Good baseline match. Consider adding missing skills: ${missingSkills.slice(0, 3).join(", ")}.`;
    } else if (verdict === "INELIGIBLE") {
      recommendation = "Criteria gap identified. Review age/experience/education limits before applying.";
    }

    return {
      jobId: job._id?.toString() || job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      matchScore: totalMatchScore,
      eligibilityVerdict: verdict,
      factors,
      matchedSkills,
      missingSkills,
      recommendation,
    };
  }

  /**
   * Ranks candidate's top active jobs by AI Match Percentage across all sources
   */
  static async getCandidateMatchedJobs(userId: string): Promise<JobMatchResult[]> {
    const profile = await ProfileService.getProfileByUserId(userId);
    const { jobs } = await JobDiscoveryService.searchJobs({ page: 1, limit: 100, sourceCategory: "All" });

    const results: JobMatchResult[] = [];
    for (const job of jobs) {
      const match = this.evaluateMatch(profile, job);
      results.push(match);
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
