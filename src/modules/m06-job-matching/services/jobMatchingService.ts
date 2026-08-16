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

/**
 * Ordinal Degree Hierarchy Ranking Table for Academic Ladders
 * Tier 5: Doctorate / Ph.D
 * Tier 4: Master's / M.Tech / M.E. / MCA / M.Sc / Post Graduation / M.Com / M.A. / MBA
 * Tier 3: Bachelor's / B.Tech / B.E. / BCA / B.Sc / Graduation / B.Com / B.A. / BBA
 * Tier 2: Diploma / Polytechnic / ITI
 * Tier 1: 10+2 / 12th Pass / Higher Secondary / Intermediate
 * Tier 0: 10th Pass / SSLC / Matriculation
 */
const DEGREE_TIER_RANK: Record<string, number> = {
  "ph.d": 5, "phd": 5, "doctorate": 5,
  "m.tech": 4, "m.e.": 4, "mca": 4, "m.sc": 4, "master": 4, "post graduation": 4, "pg": 4, "m.com": 4, "m.a.": 4, "mba": 4, "llm": 4, "md": 4, "ms": 4,
  "b.tech": 3, "b.e.": 3, "bca": 3, "b.sc": 3, "bachelor": 3, "graduation": 3, "b.com": 3, "b.a.": 3, "bba": 3,
  "diploma": 2, "polytechnic": 2, "iti": 2,
  "10+2": 1, "12th": 1, "higher secondary": 1, "intermediate": 1,
  "10th": 0, "sslc": 0, "matriculation": 0,
};

/**
 * Domain-Specific Professional Credentials
 * These require direct title matching and cannot be substituted by unrelated academic degrees via ordinal rank comparison.
 */
const PROFESSIONAL_CREDENTIALS = new Set(["ca", "icwa", "llb", "mbbs", "b.ed"]);

export class JobMatchingService {
  /**
   * Evaluates ordinal degree rank for a qualification string.
   * Sorts dictionary keys by length descending to prevent substring collisions (e.g. "bca" matching "ca" prematurely).
   * Unrecognized requirement strings default to sentinel -1.
   */
  private static getDegreeTierRank(degreeStr: string): number {
    const d = (degreeStr || "").toLowerCase();
    const sortedKeys = Object.keys(DEGREE_TIER_RANK).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (d.includes(key)) return DEGREE_TIER_RANK[key];
    }
    return -1; // Sentinel -1: Unrecognized domain requirement
  }

  /**
   * Normalizes technical skill names & handles special punctuation tokens (c++, c#, .net)
   */
  private static normalizeSkillToken(skill: string): string {
    return skill
      .trim()
      .toLowerCase()
      .replace(/c\+\+/g, "cplusplus")
      .replace(/c#/g, "csharp")
      .replace(/\.net/g, "dotnet")
      .replace(/node\.js/g, "nodejs")
      .replace(/react\.js/g, "reactjs")
      .replace(/vue\.js/g, "vuejs");
  }

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

    // 1. Education Factor Evaluation (Weight: 25) — Disambiguated Ordinal Hierarchy Engine
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
        const candidateHighestRank = Math.max(...candidateDegreeTitles.map((d: string) => this.getDegreeTierRank(d)));

        const matchesRequired = requiredEducation.some((reqStr: string) => {
          const reqLower = reqStr.toLowerCase();
          const isDirectMatch = candidateDegreeTitles.some((candDeg: string) => candDeg.includes(reqLower) || reqLower.includes(candDeg));
          
          // Step 1: If direct title match succeeds, PASS IMMEDIATELY
          if (isDirectMatch) return true;

          // Step 2: Direction A — If job explicitly requires a professional credential (CA, LLB, MBBS), and direct match failed -> RETURN FALSE EARLY
          if (PROFESSIONAL_CREDENTIALS.has(reqLower)) {
            return false;
          }

          // Step 3: Direction B — If candidate holds ONLY professional credentials (e.g. LLB), and job requires engineering degrees (B.Tech/M.Tech) -> RETURN FALSE EARLY
          const candidateHasOnlyProfessional = candidateDegreeTitles.every((candDeg: string) =>
            Array.from(PROFESSIONAL_CREDENTIALS).some((cred) => candDeg.includes(cred))
          );
          if (candidateHasOnlyProfessional && (reqLower.includes("b.tech") || reqLower.includes("m.tech") || reqLower.includes("b.e.") || reqLower.includes("m.e."))) {
            return false;
          }

          // Step 4: Check if requirement is in dictionary
          const reqRank = this.getDegreeTierRank(reqLower);
          if (reqRank === -1) {
            return false;
          }

          // Step 5: Fall through to Ordinal Rank Comparison (Higher academic qualification satisfies lower academic requirement)
          return candidateHighestRank >= reqRank;
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

    // 4. Skills Match Evaluation (Weight: 25) — Normalized Punctuation & Distinct Token Match
    let skillScore = 25;
    const rawSkills = candidateProfile?.skills?.technicalSkills || candidateProfile?.skills || [];
    const candidateSkillList = (Array.isArray(rawSkills) ? rawSkills : []).map((s: any) =>
      typeof s === "string" ? s : s.skillName || ""
    );
    const jobSkills = job.skills || [];

    if (jobSkills.length > 0) {
      for (const js of jobSkills) {
        const normJob = this.normalizeSkillToken(js);
        
        const isMatched = candidateSkillList.some((cs: string) => {
          const normCandidate = this.normalizeSkillToken(cs);
          
          // Exact token match after normalization
          if (normCandidate === normJob) return true;

          // Word boundary match for distinct non-punctuated tokens
          const escapedNormJob = normJob.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`\\b${escapedNormJob}\\b`, "i");
          return regex.test(normCandidate);
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
   * Uses dynamic unbounded pagination to fetch ALL canonical jobs without arbitrary ceilings.
   */
  static async getCandidateMatchedJobs(userId: string): Promise<JobMatchResult[]> {
    const profile = await ProfileService.getProfileByUserId(userId);
    
    // Unbounded Dynamic Pagination Engine: Fetches 100% of jobs using total count from searchJobs()
    const allJobs: Array<any> = [];
    let page = 1;
    const limit = 100;
    let total = 0;

    do {
      const res = await JobDiscoveryService.searchJobs({ page, limit, sourceCategory: "All" });
      allJobs.push(...res.jobs);
      total = res.total;
      page++;
    } while (allJobs.length < total && page <= 50);

    const results: JobMatchResult[] = [];
    for (const job of allJobs) {
      const match = this.evaluateMatch(profile, job);
      results.push(match);
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
