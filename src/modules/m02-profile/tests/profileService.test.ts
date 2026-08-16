import { describe, it, expect } from "vitest";
import { personalInfoSchema, educationItemSchema, experienceItemSchema, skillsSchema } from "../schemas/profileSchemas";
import { ProfileService } from "../services/profileService";

describe("M02 — Master Career Profile Unit Tests", () => {
  it("should validate personal info schema correctly", () => {
    const validPersonal = {
      phone: "+91 9876543210",
      dateOfBirth: "2000-01-01",
      gender: "Male" as const,
      category: "General" as const,
      city: "New Delhi",
      state: "Delhi",
    };

    const res = personalInfoSchema.safeParse(validPersonal);
    expect(res.success).toBe(true);
  });

  it("should validate education item schema correctly", () => {
    const validEdu = {
      level: "Graduation" as const,
      degree: "B.Tech Computer Science",
      institution: "IIT Delhi",
      yearOfPassing: 2024,
      percentageOrCgpa: "8.9 CGPA",
    };

    const res = educationItemSchema.safeParse(validEdu);
    expect(res.success).toBe(true);
  });

  it("should calculate Profile Completeness Index (PCI) accurately", () => {
    const mockProfile = {
      personal: {
        phone: "+91 9876543210",
        dateOfBirth: "2000-01-01",
        gender: "Male",
        city: "New Delhi",
        state: "Delhi",
        category: "General",
      },
      education: [
        { level: "Graduation", degree: "B.Tech CS", institution: "IIT", yearOfPassing: 2024 },
        { level: "12th", degree: "CBSE Science", institution: "DPS", yearOfPassing: 2020 },
      ],
      experience: [
        { company: "Tech Corp", role: "Frontend Developer", startDate: "2024-01-01", isCurrent: true },
      ],
      skills: {
        technicalSkills: ["React", "TypeScript", "Next.js", "Node.js"],
        softSkills: ["Communication"],
        toolsAndFrameworks: ["Git"],
        languages: ["English", "Hindi"],
      },
      preferences: {
        preferredJobTypes: ["Private", "MNC"],
        preferredWorkModes: ["Remote", "Hybrid"],
        preferredLocations: ["Bangalore", "Delhi"],
        targetRoles: ["Software Engineer"],
      },
    };

    const completeness = ProfileService.calculateCompleteness(mockProfile as any);
    expect(completeness.score).toBe(100);
    expect(completeness.missingFields.length).toBe(0);
  });

  it("should identify missing fields when profile is partial", () => {
    const partialProfile = {
      personal: {
        phone: "+91 9876543210",
      },
      education: [],
      experience: [],
      skills: { technicalSkills: [], softSkills: [], toolsAndFrameworks: [], languages: [] },
      preferences: { preferredJobTypes: [], preferredWorkModes: [], preferredLocations: [], targetRoles: [] },
    };

    const completeness = ProfileService.calculateCompleteness(partialProfile as any);
    expect(completeness.score).toBeLessThan(50);
    expect(completeness.missingFields).toContain("Education History");
    expect(completeness.missingFields).toContain("Work Experience");
  });
});
