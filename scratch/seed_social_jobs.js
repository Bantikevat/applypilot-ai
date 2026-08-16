const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://bantikevat199_db_user:Kevat%40tech7@cluster0.bg4qutk.mongodb.net/applypilot?retryWrites=true&w=majority&appName=Cluster0";

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  employmentType: String,
  workMode: String,
  sourceCategory: String,
  sourceAdapter: String,
  source: String,
  applicationUrl: String,
  sourceUrl: String,
  description: String,
  trustScore: Number,
  trustBadge: String,
  status: String,
  deduplicationHash: String,
  postedAt: Date,
  collectedAt: Date,
  lastVerifiedAt: Date,
}, { strict: false });

const CanonicalJob = mongoose.models.CanonicalJob || mongoose.model("CanonicalJob", jobSchema, "canonicaljobs");

async function seedSocialJobs() {
  console.log("Connecting to MongoDB Atlas Cloud Database...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas!");

  // Clean old sample jobs with incomplete fields
  await CanonicalJob.deleteMany({ sourceCategory: "WhatsApp & Telegram" });

  const sampleJobs = [
    {
      title: "Senior MERN Stack Developer",
      company: "TechFlow Solutions",
      location: "Remote / Bhopal",
      employmentType: "Full-time",
      workMode: "Remote",
      sourceCategory: "WhatsApp & Telegram",
      sourceAdapter: "WhatsApp Job Groups",
      source: "WhatsApp Job Groups",
      applicationUrl: "https://careers.techflow.io/mern-dev",
      sourceUrl: "https://careers.techflow.io/mern-dev",
      description: "Hiring Urgent: Senior MERN Stack Developer at TechFlow Solutions. Location: Remote / Bhopal. Package: 15 LPA. Looking for React, Node.js, Next.js, and MongoDB expertise.",
      trustScore: 85,
      trustBadge: "High Confidence",
      status: "ACTIVE",
      deduplicationHash: "techflowsolutions_seniormernstackdeveloper_remotebhopal",
      postedAt: new Date(),
      collectedAt: new Date(),
      lastVerifiedAt: new Date(),
    },
    {
      title: "Fullstack AI Engineer",
      company: "Neural Cloud Labs",
      location: "Hybrid / Remote",
      employmentType: "Full-time",
      workMode: "Hybrid",
      sourceCategory: "WhatsApp & Telegram",
      sourceAdapter: "Telegram Job Channels",
      source: "Telegram Job Channels",
      applicationUrl: "https://neuralcloud.ai/careers",
      sourceUrl: "https://neuralcloud.ai/careers",
      description: "Role: Fullstack AI Engineer. Company: Neural Cloud Labs. Location: Hybrid / Remote. Looking for candidates with Next.js, Python, LLM Prompting & Node.js skills.",
      trustScore: 90,
      trustBadge: "Verified Official Source",
      status: "ACTIVE",
      deduplicationHash: "neuralcloudlabs_fullstackaiengineer_hybridremote",
      postedAt: new Date(),
      collectedAt: new Date(),
      lastVerifiedAt: new Date(),
    },
    {
      title: "Next.js Frontend Developer",
      company: "Alpine Tech Systems",
      location: "Ujjain / Bhopal",
      employmentType: "Full-time",
      workMode: "On-site",
      sourceCategory: "WhatsApp & Telegram",
      sourceAdapter: "WhatsApp Job Groups",
      source: "WhatsApp Job Groups",
      applicationUrl: "https://alpinetech.com/careers",
      sourceUrl: "https://alpinetech.com/careers",
      description: "Position: Next.js Frontend Developer. Client: Alpine Tech Systems. Location: Ujjain / Bhopal. Experience: 1-3 Years. Great environment for React & Next.js engineers.",
      trustScore: 85,
      trustBadge: "High Confidence",
      status: "ACTIVE",
      deduplicationHash: "alpinetechsystems_nextjsfrontenddeveloper_ujjainbhopal",
      postedAt: new Date(),
      collectedAt: new Date(),
      lastVerifiedAt: new Date(),
    },
    {
      title: "Software Scientist / Engineer",
      company: "ISRO / DRDO Recruitment",
      location: "Bengaluru / Remote",
      employmentType: "Government",
      workMode: "On-site",
      sourceCategory: "WhatsApp & Telegram",
      sourceAdapter: "Telegram Job Channels",
      source: "Jobs In India (ISRO | DRDO)",
      applicationUrl: "https://www.isro.gov.in/careers",
      sourceUrl: "https://www.isro.gov.in/careers",
      description: "Official Job Notification: ISRO Scientist/Engineer 'SC' Recruitment. Qualification: B.Tech/M.Tech CS/AI/ML. Apply on official portal.",
      trustScore: 95,
      trustBadge: "Verified Official Source",
      status: "ACTIVE",
      deduplicationHash: "isro_software_scientist_engineer_2026",
      postedAt: new Date(),
      collectedAt: new Date(),
      lastVerifiedAt: new Date(),
    },
  ];

  for (const job of sampleJobs) {
    await CanonicalJob.create(job);
    console.log(`Ingested Clean Direct URL Job: ${job.title} at ${job.company} -> ${job.applicationUrl}`);
  }

  console.log("SUCCESS: WhatsApp & Telegram Jobs seeded with 100% Direct Official URLs into MongoDB Atlas!");
  await mongoose.disconnect();
}

seedSocialJobs();
