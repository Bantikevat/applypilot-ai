export interface SkillBenchmarkItem {
  skillName: string;
  minProficiency: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  category: "Technical" | "Domain" | "Soft Skill" | "Aptitude";
  importance: "CRITICAL" | "HIGH" | "MEDIUM";
  estimatedDaysToMaster: number;
  learningResourceUrl: string;
  learningResourceTitle: string;
}

export interface RoleBenchmark {
  id: string;
  roleTitle: string;
  category: "Engineering" | "Data & AI" | "Government" | "Management";
  description: string;
  skills: SkillBenchmarkItem[];
}

export const ROLE_BENCHMARKS: Record<string, RoleBenchmark> = {
  "fullstack-ai": {
    id: "fullstack-ai",
    roleTitle: "Fullstack AI Engineer",
    category: "Engineering",
    description: "Builds modern web applications, agentic workflows, and LLM integrations.",
    skills: [
      {
        skillName: "React",
        minProficiency: "ADVANCED",
        category: "Technical",
        importance: "CRITICAL",
        estimatedDaysToMaster: 7,
        learningResourceUrl: "https://react.dev/learn",
        learningResourceTitle: "Official React Documentation & Patterns",
      },
      {
        skillName: "TypeScript",
        minProficiency: "ADVANCED",
        category: "Technical",
        importance: "CRITICAL",
        estimatedDaysToMaster: 5,
        learningResourceUrl: "https://www.typescriptlang.org/docs/",
        learningResourceTitle: "TypeScript Handbook & Strict Typing",
      },
      {
        skillName: "Node.js",
        minProficiency: "INTERMEDIATE",
        category: "Technical",
        importance: "CRITICAL",
        estimatedDaysToMaster: 7,
        learningResourceUrl: "https://nodejs.org/en/learn",
        learningResourceTitle: "Node.js Architecture & REST APIs",
      },
      {
        skillName: "Next.js",
        minProficiency: "INTERMEDIATE",
        category: "Technical",
        importance: "HIGH",
        estimatedDaysToMaster: 5,
        learningResourceUrl: "https://nextjs.org/docs",
        learningResourceTitle: "Next.js App Router & Server Components",
      },
      {
        skillName: "LLM Prompt Architecture",
        minProficiency: "INTERMEDIATE",
        category: "Domain",
        importance: "HIGH",
        estimatedDaysToMaster: 4,
        learningResourceUrl: "https://platform.openai.com/docs/guides/prompt-engineering",
        learningResourceTitle: "Agentic Prompt Engineering Guide",
      },
    ],
  },
  "frontend-lead": {
    id: "frontend-lead",
    roleTitle: "Frontend Lead / UI Architect",
    category: "Engineering",
    description: "Architects high-performance user interfaces, design systems, and Web Vitals.",
    skills: [
      {
        skillName: "React",
        minProficiency: "EXPERT",
        category: "Technical",
        importance: "CRITICAL",
        estimatedDaysToMaster: 10,
        learningResourceUrl: "https://react.dev/learn",
        learningResourceTitle: "Advanced React Hooks & Performance Tuning",
      },
      {
        skillName: "Tailwind CSS",
        minProficiency: "ADVANCED",
        category: "Technical",
        importance: "HIGH",
        estimatedDaysToMaster: 3,
        learningResourceUrl: "https://tailwindcss.com/docs",
        learningResourceTitle: "Tailwind Design Tokens & Glassmorphism",
      },
      {
        skillName: "System Design",
        minProficiency: "ADVANCED",
        category: "Domain",
        importance: "CRITICAL",
        estimatedDaysToMaster: 14,
        learningResourceUrl: "https://github.com/donnemartin/system-design-primer",
        learningResourceTitle: "Frontend & Web System Design Primer",
      },
    ],
  },
  "govt-aso": {
    id: "govt-aso",
    roleTitle: "Assistant Section Officer (SSC ASO)",
    category: "Government",
    description: "Central Secretariat Service administrative officer in Government of India.",
    skills: [
      {
        skillName: "General Intelligence",
        minProficiency: "ADVANCED",
        category: "Aptitude",
        importance: "CRITICAL",
        estimatedDaysToMaster: 20,
        learningResourceUrl: "https://ssc.gov.in",
        learningResourceTitle: "SSC CGL Tier I & II Reasoning Guide",
      },
      {
        skillName: "Quantitative Aptitude",
        minProficiency: "ADVANCED",
        category: "Aptitude",
        importance: "CRITICAL",
        estimatedDaysToMaster: 30,
        learningResourceUrl: "https://ssc.gov.in",
        learningResourceTitle: "SSC Mathematics & Geometry Formulas",
      },
      {
        skillName: "Computer Proficiency",
        minProficiency: "INTERMEDIATE",
        category: "Technical",
        importance: "HIGH",
        estimatedDaysToMaster: 5,
        learningResourceUrl: "https://ssc.gov.in",
        learningResourceTitle: "DEST & MS Office Computer Proficiency",
      },
    ],
  },
};
