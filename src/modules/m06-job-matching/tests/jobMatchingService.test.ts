import { describe, it, expect } from "vitest";
import { evaluateMatchRequestSchema } from "../schemas/matchingSchemas";
import { JobMatchingService } from "../services/jobMatchingService";

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
        { skillName: "React", proficiency: "ADVANCED" },
        { skillName: "TypeScript", proficiency: "INTERMEDIATE" },
        { skillName: "Node.js", proficiency: "INTERMEDIATE" },
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

  it("should detect ineligible verdict when mandatory age limit fails on Government job", () => {
    const overageCandidate = {
      personalInfo: {
        dateOfBirth: "1985-01-01", // 41+ years old
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
      skills: ["Aptitude"],
    };

    const result = JobMatchingService.evaluateMatch(overageCandidate, sscGovtJob);

    expect(result.eligibilityVerdict).toBe("INELIGIBLE");
    const ageFactor = result.factors.find((f) => f.factor === "Age");
    expect(ageFactor?.passed).toBe(false);
  });
});
