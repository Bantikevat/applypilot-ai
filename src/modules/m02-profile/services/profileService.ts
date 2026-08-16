import fs from "fs";
import path from "path";
import { Profile, IProfileDocument } from "../models/Profile";
import { UpdateProfileInput } from "../schemas/profileSchemas";
import { connectToDatabase } from "@/lib/db/mongoose";

export interface ProfileCompletenessResult {
  score: number;
  missingFields: string[];
  fieldBreakdown: {
    personal: number;
    education: number;
    experience: number;
    skills: number;
    preferences: number;
  };
}

const PROFILE_DISK_DIR = path.join(process.cwd(), "uploads", "profile");
const PROFILE_DISK_FILE = path.join(PROFILE_DISK_DIR, "banti_profile.json");

function getDiskProfile(): any | null {
  try {
    if (fs.existsSync(PROFILE_DISK_FILE)) {
      const data = fs.readFileSync(PROFILE_DISK_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return null;
}

function saveDiskProfile(profile: any): void {
  try {
    if (!fs.existsSync(PROFILE_DISK_DIR)) {
      fs.mkdirSync(PROFILE_DISK_DIR, { recursive: true });
    }
    fs.writeFileSync(PROFILE_DISK_FILE, JSON.stringify(profile, null, 2), "utf-8");
  } catch {}
}

// Default Candidate Profile initialized with Banti Kevat's verified resume data & Date of Birth (09-07-1999)
export const BANTI_DEFAULT_PROFILE = {
  personal: {
    phone: "+91-6264466512",
    dateOfBirth: "1999-07-09",
    gender: "Male",
    category: "OBC",
    city: "Ujjain",
    state: "Madhya Pradesh",
    country: "India",
    address: "Ujjain, Madhya Pradesh, India",
    pincode: "456001",
  },
  education: [
    {
      level: "Post Graduation",
      degree: "M.Tech in Artificial Intelligence & Machine Learning",
      institution: "Sam Global University",
      boardOrUniversity: "Sam Global University, Bhopal, MP",
      yearOfPassing: 2027,
      isPursuing: true,
      specialization: "AI & Machine Learning",
    },
    {
      level: "Graduation",
      degree: "B.Tech in Computer Science & Engineering",
      institution: "Alpine Institute of Technology",
      boardOrUniversity: "Alpine Institute of Technology, Ujjain, MP",
      yearOfPassing: 2024,
      percentageOrCgpa: "CGPA: 7.7",
      isPursuing: false,
      specialization: "Computer Science & Engineering",
    },
    {
      level: "Diploma",
      degree: "ITI - Computer Operator & Programming Assistant",
      institution: "Hindupat Pvt ITI",
      boardOrUniversity: "Raghogarh, Madhya Pradesh",
      yearOfPassing: 2018,
      percentageOrCgpa: "72%",
      isPursuing: false,
    },
  ],
  experience: [
    {
      company: "Byteflow Tech",
      role: "MERN Stack & WordPress Developer",
      startDate: "2025-10-01",
      endDate: "",
      isCurrent: true,
      location: "Remote / On-site",
      responsibilities: "Develop and maintain full-stack MERN and Next.js applications for live client projects. Delivered 3+ major client projects involving React.js, Next.js, Node.js, Express.js, MongoDB, REST APIs, and responsive UI. Improved application performance by 30%.",
    },
    {
      company: "Nexan IT Tech",
      role: "MERN Stack Developer",
      startDate: "2023-09-01",
      endDate: "2025-09-30",
      isCurrent: false,
      location: "Remote",
      responsibilities: "Developed and maintained production MERN Stack applications. Took ownership of features from requirements to deployment. Implemented JWT auth, RBAC, reusable React components, and performance optimizations.",
    },
  ],
  skills: {
    technicalSkills: [
      "JavaScript (ES6+)",
      "React.js",
      "Next.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "TypeScript",
      "RESTful APIs",
      "Tailwind CSS",
      "Mongoose",
      "JWT Authentication",
      "Role-Based Access Control (RBAC)",
      "Python",
      "Django",
      "MySQL",
      "Git",
      "GitHub",
      "AWS",
      "Linux (Ubuntu)",
      "Nginx",
      "Prompt Engineering",
      "AI Agents",
      "Socket.io",
      "WordPress",
    ],
    softSkills: [
      "Problem Solving",
      "Team Leadership",
      "Requirements Analysis",
      "Client Communication",
    ],
    toolsAndFrameworks: [
      "Next.js 14",
      "React.js",
      "Express.js",
      "Mongoose",
      "Tailwind CSS",
      "VS Code",
      "Postman",
      "Socket.io",
      "Git",
      "Nginx",
    ],
    languages: ["English", "Hindi"],
  },
  preferences: {
    preferredJobTypes: ["Full-time", "Remote", "Contract"],
    preferredWorkModes: ["Remote", "Hybrid", "On-site"],
    preferredLocations: ["Ujjain", "Bhopal", "Bangalore", "Remote", "India"],
    targetSalaryMin: 1200000,
    targetRoles: [
      "Fullstack AI Engineer",
      "Senior MERN Stack Developer",
      "Next.js Developer",
      "Backend & Cloud Architect",
      "AI & Automation Engineer",
    ],
  },
};

export class ProfileService {
  /**
   * Calculates Profile Completeness Index (PCI) and missing field radar
   */
  static calculateCompleteness(profile: any): ProfileCompletenessResult {
    let personalScore = 0;
    let educationScore = 0;
    let experienceScore = 0;
    let skillsScore = 0;
    let preferencesScore = 0;

    const missingFields: string[] = [];

    // Personal Info Evaluation (30% weight)
    if (profile.personal?.phone) personalScore += 8;
    else missingFields.push("Phone Number");

    if (profile.personal?.dateOfBirth) personalScore += 6;
    else missingFields.push("Date of Birth");

    if (profile.personal?.gender) personalScore += 4;

    if (profile.personal?.city && profile.personal?.state) personalScore += 8;
    else missingFields.push("City & State Location");

    if (profile.personal?.category) personalScore += 4;

    // Education Evaluation (25% weight)
    if (profile.education && profile.education.length > 0) {
      educationScore = Math.min(25, profile.education.length * 12.5);
    } else {
      missingFields.push("Education History");
    }

    // Experience Evaluation (20% weight)
    if (profile.experience && profile.experience.length > 0) {
      experienceScore = 20;
    } else {
      missingFields.push("Work Experience");
    }

    // Skills Evaluation (15% weight)
    const techSkillsCount = profile.skills?.technicalSkills?.length || 0;
    if (techSkillsCount >= 3) {
      skillsScore = 15;
    } else if (techSkillsCount > 0) {
      skillsScore = 8;
      missingFields.push("At least 3 Technical Skills");
    } else {
      missingFields.push("Skills & Frameworks");
    }

    // Preferences Evaluation (10% weight)
    if (profile.preferences?.targetRoles?.length && profile.preferences?.preferredWorkModes?.length) {
      preferencesScore = 10;
    } else {
      missingFields.push("Job Roles & Work Mode Preferences");
    }

    const score = Math.min(100, Math.round(personalScore + educationScore + experienceScore + skillsScore + preferencesScore));

    return {
      score,
      missingFields,
      fieldBreakdown: {
        personal: personalScore,
        education: educationScore,
        experience: experienceScore,
        skills: skillsScore,
        preferences: preferencesScore,
      },
    };
  }

  /**
   * Retrieves profile by userId (merging MongoDB Atlas + Persistent Disk Backup)
   */
  static async getProfileByUserId(userId: string): Promise<{ profile: any; completeness: ProfileCompletenessResult }> {
    let diskProfile = getDiskProfile();

    try {
      await connectToDatabase();

      let profile = await Profile.findOne({ userId });

      if (!profile) {
        profile = await Profile.create({
          userId,
          ...(diskProfile || BANTI_DEFAULT_PROFILE),
          completenessScore: 100,
        });
      } else {
        profile.personal = { ...profile.personal, dateOfBirth: "1999-07-09" };
        await profile.save();
      }

      const completeness = this.calculateCompleteness(profile);

      if (profile.completenessScore !== completeness.score) {
        profile.completenessScore = completeness.score;
        await profile.save();
      }

      saveDiskProfile(profile.toObject ? profile.toObject() : profile);

      return { profile, completeness };
    } catch {
      console.warn("[ProfileService] MongoDB connection offline. Reading persistent disk profile backup.");

      let memProfile = diskProfile || {
        userId,
        ...BANTI_DEFAULT_PROFILE,
        completenessScore: 100,
      };

      memProfile.personal = { ...memProfile.personal, dateOfBirth: "1999-07-09" };

      const completeness = this.calculateCompleteness(memProfile);
      memProfile.completenessScore = completeness.score;

      saveDiskProfile(memProfile);

      return { profile: memProfile, completeness };
    }
  }

  /**
   * Updates profile data sections for a candidate
   */
  static async updateProfile(userId: string, data: UpdateProfileInput): Promise<{ profile: any; completeness: ProfileCompletenessResult }> {
    let currentProfile = getDiskProfile() || {
      userId,
      ...BANTI_DEFAULT_PROFILE,
      completenessScore: 100,
    };

    try {
      await connectToDatabase();

      let profile = await Profile.findOne({ userId });

      if (!profile) {
        profile = new Profile({ userId });
      }

      if (data.personal) {
        profile.personal = { ...profile.personal, ...data.personal };
        currentProfile.personal = { ...currentProfile.personal, ...data.personal };
      }

      if (data.education) {
        profile.education = data.education as any;
        currentProfile.education = data.education;
      }

      if (data.experience) {
        profile.experience = data.experience as any;
        currentProfile.experience = data.experience;
      }

      if (data.skills) {
        profile.skills = { ...profile.skills, ...data.skills };
        currentProfile.skills = { ...currentProfile.skills, ...data.skills };
      }

      if (data.preferences) {
        profile.preferences = { ...profile.preferences, ...data.preferences };
        currentProfile.preferences = { ...currentProfile.preferences, ...data.preferences };
      }

      const completeness = this.calculateCompleteness(profile);
      profile.completenessScore = completeness.score;
      currentProfile.completenessScore = completeness.score;

      await profile.save();
      saveDiskProfile(currentProfile);

      return { profile, completeness };
    } catch {
      console.warn("[ProfileService] MongoDB connection offline. Updating persistent disk profile backup.");

      if (data.personal) {
        currentProfile.personal = { ...currentProfile.personal, ...data.personal };
      }
      if (data.education) {
        currentProfile.education = data.education;
      }
      if (data.experience) {
        currentProfile.experience = data.experience;
      }
      if (data.skills) {
        currentProfile.skills = { ...currentProfile.skills, ...data.skills };
      }
      if (data.preferences) {
        currentProfile.preferences = { ...currentProfile.preferences, ...data.preferences };
      }

      const completeness = this.calculateCompleteness(currentProfile);
      currentProfile.completenessScore = completeness.score;

      saveDiskProfile(currentProfile);

      return { profile: currentProfile, completeness };
    }
  }
}
