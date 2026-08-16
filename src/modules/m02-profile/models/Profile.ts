import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEducation {
  id?: string;
  level: string;
  degree: string;
  institution: string;
  boardOrUniversity?: string;
  yearOfPassing: number;
  percentageOrCgpa?: string;
  specialization?: string;
  isPursuing?: boolean;
}

export interface IExperience {
  id?: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  responsibilities?: string;
}

export interface IProfileDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  personal: {
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    category?: string;
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    pincode?: string;
  };
  education: IEducation[];
  experience: IExperience[];
  skills: {
    technicalSkills: string[];
    softSkills: string[];
    toolsAndFrameworks: string[];
    languages: string[];
  };
  preferences: {
    preferredJobTypes: string[];
    preferredWorkModes: string[];
    preferredLocations: string[];
    targetSalaryMin?: number;
    targetRoles: string[];
  };
  completenessScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>({
  level: { type: String, required: true },
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  boardOrUniversity: { type: String },
  yearOfPassing: { type: Number, required: true },
  percentageOrCgpa: { type: String },
  specialization: { type: String },
  isPursuing: { type: Boolean, default: false },
});

const ExperienceSchema = new Schema<IExperience>({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String },
  isCurrent: { type: Boolean, default: false },
  responsibilities: { type: String },
});

const ProfileSchema = new Schema<IProfileDocument>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      unique: true,
      index: true,
    },
    personal: {
      phone: { type: String },
      dateOfBirth: { type: String },
      gender: { type: String },
      category: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      address: { type: String },
      pincode: { type: String },
    },
    education: [EducationSchema],
    experience: [ExperienceSchema],
    skills: {
      technicalSkills: [{ type: String }],
      softSkills: [{ type: String }],
      toolsAndFrameworks: [{ type: String }],
      languages: [{ type: String }],
    },
    preferences: {
      preferredJobTypes: [{ type: String }],
      preferredWorkModes: [{ type: String }],
      preferredLocations: [{ type: String }],
      targetSalaryMin: { type: Number },
      targetRoles: [{ type: String }],
    },
    completenessScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile: Model<IProfileDocument> =
  mongoose.models.Profile || mongoose.model<IProfileDocument>("Profile", ProfileSchema);
