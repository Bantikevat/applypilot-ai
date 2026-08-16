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

// In-Memory Profile Fallback when local MongoDB server is offline
const memoryProfiles = new Map<string, any>();

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
   * Retrieves profile by userId, initializing default profile if not present
   */
  static async getProfileByUserId(userId: string): Promise<{ profile: any; completeness: ProfileCompletenessResult }> {
    try {
      await connectToDatabase();

      let profile = await Profile.findOne({ userId });

      if (!profile) {
        profile = await Profile.create({
          userId,
          personal: {},
          education: [],
          experience: [],
          skills: { technicalSkills: [], softSkills: [], toolsAndFrameworks: [], languages: [] },
          preferences: { preferredJobTypes: [], preferredWorkModes: [], preferredLocations: [], targetRoles: [] },
          completenessScore: 0,
        });
      }

      const completeness = this.calculateCompleteness(profile);

      if (profile.completenessScore !== completeness.score) {
        profile.completenessScore = completeness.score;
        await profile.save();
      }

      return { profile, completeness };
    } catch {
      console.warn("MongoDB connection offline. Using In-Memory Profile store.");

      let memProfile = memoryProfiles.get(userId);
      if (!memProfile) {
        memProfile = {
          userId,
          personal: {},
          education: [],
          experience: [],
          skills: { technicalSkills: [], softSkills: [], toolsAndFrameworks: [], languages: [] },
          preferences: { preferredJobTypes: [], preferredWorkModes: [], preferredLocations: [], targetRoles: [] },
          completenessScore: 0,
        };
        memoryProfiles.set(userId, memProfile);
      }

      const completeness = this.calculateCompleteness(memProfile);
      memProfile.completenessScore = completeness.score;

      return { profile: memProfile, completeness };
    }
  }

  /**
   * Updates profile data sections for a candidate
   */
  static async updateProfile(userId: string, data: UpdateProfileInput): Promise<{ profile: any; completeness: ProfileCompletenessResult }> {
    try {
      await connectToDatabase();

      let profile = await Profile.findOne({ userId });

      if (!profile) {
        profile = new Profile({ userId });
      }

      if (data.personal) {
        profile.personal = { ...profile.personal, ...data.personal };
      }

      if (data.education) {
        profile.education = data.education as any;
      }

      if (data.experience) {
        profile.experience = data.experience as any;
      }

      if (data.skills) {
        profile.skills = { ...profile.skills, ...data.skills };
      }

      if (data.preferences) {
        profile.preferences = { ...profile.preferences, ...data.preferences };
      }

      const completeness = this.calculateCompleteness(profile);
      profile.completenessScore = completeness.score;

      await profile.save();

      return { profile, completeness };
    } catch {
      console.warn("MongoDB connection offline. Updating In-Memory Profile store.");

      let memProfile = memoryProfiles.get(userId) || {
        userId,
        personal: {},
        education: [],
        experience: [],
        skills: { technicalSkills: [], softSkills: [], toolsAndFrameworks: [], languages: [] },
        preferences: { preferredJobTypes: [], preferredWorkModes: [], preferredLocations: [], targetRoles: [] },
        completenessScore: 0,
      };

      if (data.personal) {
        memProfile.personal = { ...memProfile.personal, ...data.personal };
      }
      if (data.education) {
        memProfile.education = data.education;
      }
      if (data.experience) {
        memProfile.experience = data.experience;
      }
      if (data.skills) {
        memProfile.skills = { ...memProfile.skills, ...data.skills };
      }
      if (data.preferences) {
        memProfile.preferences = { ...memProfile.preferences, ...data.preferences };
      }

      const completeness = this.calculateCompleteness(memProfile);
      memProfile.completenessScore = completeness.score;

      memoryProfiles.set(userId, memProfile);

      return { profile: memProfile, completeness };
    }
  }
}
