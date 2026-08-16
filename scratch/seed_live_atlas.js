const mongoose = require("mongoose");

const uri = "mongodb+srv://bantikevat199_db_user:Kevat%40tech7@cluster0.bg4qutk.mongodb.net/applypilot?retryWrites=true&w=majority&appName=Cluster0";

const BANTI_DEFAULT_PROFILE = {
  userId: "banti_kevat_default_user",
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
    softSkills: ["Problem Solving", "Team Leadership", "Requirements Analysis", "Client Communication"],
    toolsAndFrameworks: ["Next.js 14", "React.js", "Express.js", "Mongoose", "Tailwind CSS", "VS Code", "Postman", "Socket.io", "Git", "Nginx"],
    languages: ["English", "Hindi"],
  },
  preferences: {
    preferredJobTypes: ["Full-time", "Remote", "Contract"],
    preferredWorkModes: ["Remote", "Hybrid", "On-site"],
    preferredLocations: ["Ujjain", "Bhopal", "Bangalore", "Remote", "India"],
    targetSalaryMin: 1200000,
    targetRoles: ["Fullstack AI Engineer", "Senior MERN Stack Developer", "Next.js Developer", "Backend & Cloud Architect", "AI & Automation Engineer"],
  },
  completenessScore: 100,
};

async function seedAtlas() {
  try {
    console.log("Connecting to MongoDB Atlas Cloud Database...");
    await mongoose.connect(uri);

    const Profile = mongoose.connection.db.collection("profiles");
    await Profile.updateOne(
      { userId: "banti_kevat_default_user" },
      { $set: BANTI_DEFAULT_PROFILE },
      { upsert: true }
    );
    console.log("SUCCESS: Banti Kevat Master Profile updated with exact DOB (09-07-1999) in Live Atlas Cloud!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding Atlas:", err);
    process.exit(1);
  }
}

seedAtlas();
