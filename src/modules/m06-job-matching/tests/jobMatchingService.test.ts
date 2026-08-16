import { describe, it, expect } from "vitest";
import { evaluateMatchRequestSchema } from "../schemas/matchingSchemas";
import { JobMatchingService } from "../services/jobMatchingService";
import { NotFoundError } from "@/lib/errors/AppError";

describe("M06 — AI Job Matching & Eligibility Unit & Service Tests", () => {
  it("should validate evaluate match request schema correctly", () => {
    const validReq = { jobId: "job_test_123" };
    const res = evaluateMatchRequestSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should calculate candidate age accurately from DOB string", () => {
    const dob = "1998-05-15";
    const age = JobMatchingService.calculateAge(dob);

    expect(age).toBeDefined();
    expect(age).toBeGreaterThanOrEqual(25);
  });

  it("should throw NotFoundError if job object is null or undefined", () => {
    expect(() => JobMatchingService.evaluateMatch({}, null)).toThrowError(NotFoundError);
  });

  it("should evaluate full profile match and compute Match Percentage and Eligibility Verdict", () => {
    const candidateProfile = {
      personalInfo: {
        dateOfBirth: "1997-08-20",
        city: "Bangalore",
      },
      education: [
        { degree: "B.Tech in Computer Science", institution: "IIT", endYear: 2019 },
      ],
      experience: [
        { jobTitle: "Fullstack Engineer", companyName: "Tech Corp", startDate: "2020-01-01", isCurrentRole: true },
      ],
      skills: [
        "React",
        "TypeScript",
        "Node.js",
      ],
    };

    const job = {
      _id: "job_123",
      title: "Fullstack Developer",
      company: "Google",
      location: "Bangalore",
      employmentType: "Full-time",
      minExperienceYears: 2,
      educationRequirements: ["B.Tech"],
      skills: ["React", "TypeScript", "Node.js"],
    };

    const result = JobMatchingService.evaluateMatch(candidateProfile, job);

    expect(result).toBeDefined();
    expect(result.matchScore).toBeGreaterThanOrEqual(80);
    expect(result.eligibilityVerdict).toBe("ELIGIBLE");
    expect(result.matchedSkills.length).toBe(3);
    expect(result.missingSkills.length).toBe(0);
  });

  it("should NOT rank BCA candidate as Master's tier due to 'ca' substring collision", () => {
    const candidate = { education: [{ degree: "BCA" }], skills: [], experience: [] };
    const job = { educationRequirements: ["M.Tech"], skills: [], minExperienceYears: 0 };
    const result = JobMatchingService.evaluateMatch(candidate, job);
    const eduFactor = result.factors.find((f) => f.factor === "Education");
    expect(eduFactor?.passed).toBe(false);
  });

  it("should enforce symmetric bidirectional domain isolation (Direction 1: B.Tech candidate applying for LLB job -> FAILS)", () => {
    const btechCandidate = { education: [{ degree: "B.Tech" }], skills: [], experience: [] };
    const lawJob = { educationRequirements: ["LLB"], skills: [], minExperienceYears: 0 };
    const result = JobMatchingService.evaluateMatch(btechCandidate, lawJob);
    const eduFactor = result.factors.find((f) => f.factor === "Education");
    expect(eduFactor?.passed).toBe(false);
  });

  it("should enforce symmetric bidirectional domain isolation (Direction 2: LLB candidate applying for B.Tech job -> FAILS)", () => {
    const llbCandidate = { education: [{ degree: "LLB" }], skills: [], experience: [] };
    const btechJob = { educationRequirements: ["B.Tech"], skills: [], minExperienceYears: 0 };
    const result = JobMatchingService.evaluateMatch(llbCandidate, btechJob);
    const eduFactor = result.factors.find((f) => f.factor === "Education");
    expect(eduFactor?.passed).toBe(false);
  });

  it("should pass Education when LLB candidate applies for generic Bachelor's requirement (Direction 3: LLB candidate applying for Bachelor's -> PASSES)", () => {
    const llbCandidate = { education: [{ degree: "Bachelor of Laws (LLB)" }], skills: [], experience: [] };
    const genericJob = { educationRequirements: ["Bachelor's Degree"], skills: [], minExperienceYears: 0 };
    const result = JobMatchingService.evaluateMatch(llbCandidate, genericJob);
    const eduFactor = result.factors.find((f) => f.factor === "Education");
    expect(eduFactor?.passed).toBe(true);
  });

  it("should pass Education factor for M.Tech candidate applying for Bachelor's or 10+2 jobs via Ordinal Rank Hierarchy", () => {
    const mtechCandidate = {
      personalInfo: { city: "Bangalore" },
      education: [{ degree: "M.Tech in Artificial Intelligence", isPursuing: true }],
      experience: [],
      skills: ["Python"],
    };

    const btechJob = {
      _id: "btech_job_1",
      title: "Software Engineer",
      company: "Google",
      location: "Remote",
      employmentType: "Full-time",
      minExperienceYears: 0,
      educationRequirements: ["Bachelor's Degree in CS"],
      skills: ["Python"],
    };

    const result = JobMatchingService.evaluateMatch(mtechCandidate, btechJob);

    const eduFactor = result.factors.find((f) => f.factor === "Education");
    expect(eduFactor?.passed).toBe(true);
    expect(eduFactor?.score).toBe(25);
  });

  it("should fail Education factor when candidate degree does not match required qualification tier", () => {
    const candidateWithBA = {
      personalInfo: { city: "Delhi" },
      education: [{ degree: "Bachelor of Arts (B.A.)" }],
      experience: [],
      skills: ["Python"],
    };

    const csJob = {
      _id: "mtech_job_1",
      title: "AI Engineer",
      company: "DeepMind",
      location: "Remote",
      employmentType: "Full-time",
      minExperienceYears: 0,
      educationRequirements: ["M.Tech in CS"],
      skills: ["Python"],
    };

    const result = JobMatchingService.evaluateMatch(candidateWithBA, csJob);

    const eduFactor = result.factors.find((f) => f.factor === "Education");
    expect(eduFactor?.passed).toBe(false);
    expect(eduFactor?.score).toBe(5);
    expect(result.eligibilityVerdict).not.toBe("ELIGIBLE");
  });

  it("should pass Education factor for 10+2 / Higher Secondary SSC notices", () => {
    const candidateWith12th = {
      personalInfo: { city: "Delhi" },
      education: [{ degree: "Higher Secondary (10+2)" }],
      experience: [],
      skills: [],
    };

    const sscJob = {
      _id: "ssc_chsl_1",
      title: "Data Entry Operator",
      company: "SSC CHSL",
      location: "Delhi",
      employmentType: "Government",
      minExperienceYears: 0,
      educationRequirements: ["12th Pass / Higher Secondary"],
      skills: [],
    };

    const result = JobMatchingService.evaluateMatch(candidateWith12th, sscJob);

    const eduFactor = result.factors.find((f) => f.factor === "Education");
    expect(eduFactor?.passed).toBe(true);
    expect(eduFactor?.score).toBe(25);
  });

  it("should prevent false positive skill matches for punctuated skills (C vs C++ vs C#)", () => {
    const cppDev = {
      personalInfo: { city: "Bangalore" },
      education: [{ degree: "B.Tech" }],
      experience: [],
      skills: ["C++"], // Candidate has ONLY C++, NOT C or C#
    };

    const cJob = {
      _id: "c_embedded_job",
      title: "Embedded C Developer",
      company: "Systems Corp",
      location: "Remote",
      employmentType: "Full-time",
      minExperienceYears: 0,
      educationRequirements: [],
      skills: ["C"],
    };

    const result = JobMatchingService.evaluateMatch(cppDev, cJob);

    expect(result.matchedSkills).not.toContain("C");
    expect(result.missingSkills).toContain("C");
  });

  it("should respect Category age relaxation for OBC/SC/ST candidates on Government jobs", () => {
    const obcCandidate = {
      personal: {
        dateOfBirth: "1991-01-01", // ~35 yrs old
        category: "OBC",
      },
      education: [{ degree: "Graduation" }],
      experience: [],
      skills: [],
    };

    const sscGovtJob = {
      _id: "ssc_job_1",
      title: "Assistant Section Officer",
      company: "SSC",
      location: "Delhi",
      employmentType: "Government",
      minExperienceYears: 0,
      educationRequirements: ["Graduation"],
      skills: [],
    };

    const result = JobMatchingService.evaluateMatch(obcCandidate, sscGovtJob);

    const ageFactor = result.factors.find((f) => f.factor === "Age");
    expect(ageFactor?.passed).toBe(true); // 35 yrs is eligible under OBC (max 35 yrs)
  });

  it("should detect ineligible verdict when candidate age exceeds category relaxation", () => {
    const overageGeneralCandidate = {
      personalInfo: {
        dateOfBirth: "1985-01-01", // ~41 yrs old
        category: "General",
      },
      education: [{ degree: "Graduation" }],
      experience: [],
      skills: [],
    };

    const sscGovtJob = {
      _id: "ssc_job_1",
      title: "Assistant Section Officer",
      company: "SSC",
      location: "Delhi",
      employmentType: "Government",
      minExperienceYears: 0,
      educationRequirements: ["Graduation"],
      skills: [],
    };

    const result = JobMatchingService.evaluateMatch(overageGeneralCandidate, sscGovtJob);

    expect(result.eligibilityVerdict).toBe("INELIGIBLE");
    const ageFactor = result.factors.find((f) => f.factor === "Age");
    expect(ageFactor?.passed).toBe(false);
  });
});
