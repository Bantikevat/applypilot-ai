import { ProfileService } from "@/modules/m02-profile/services/profileService";
import { SkillGapService } from "@/modules/m07-skill-gap/services/skillGapService";
import { ApplicationTrackerService } from "@/modules/m10-application-tracker/services/applicationTrackerService";
import { CareerAnalyticsService } from "@/modules/m11-career-analytics/services/careerAnalyticsService";
import { AdvisorTopic } from "../schemas/agentSchemas";

export interface PromptChip {
  id: string;
  topic: AdvisorTopic;
  title: string;
  prompt: string;
}

export interface AgentResponse {
  reply: string;
  topic: AdvisorTopic;
  contextSummary: {
    pciScore: number;
    skillsCount: number;
    activeApplicationsCount: number;
    topSalaryRangeLpa?: string;
  };
  suggestedNextSteps: string[];
}

export const RECOMMENDED_PROMPT_CHIPS: PromptChip[] = [
  {
    id: "chip_resume",
    topic: "RESUME_ADVICE",
    title: "Optimize ATS Resume Keywords",
    prompt: "How can I optimize my Master Profile data to pass corporate ATS resume scanners for Senior Fullstack AI roles?",
  },
  {
    id: "chip_interview",
    topic: "INTERVIEW_PREP",
    title: "Mock System Design Questions",
    prompt: "Give me top 3 System Design & Next.js Architecture interview questions tailored to my profile skills.",
  },
  {
    id: "chip_govt",
    topic: "GOVT_EXAM_PREP",
    title: "SSC CGL / UPSC Exam Strategy",
    prompt: "Generate a 90-day daily study roadmap for SSC CGL Assistant Section Officer (ASO) exam.",
  },
  {
    id: "chip_skill",
    topic: "SKILL_UPGRADE",
    title: "Skill Upgrade Roadmap",
    prompt: "What critical technical skills am I missing to reach 100% readiness for Fullstack AI Engineer roles?",
  },
  {
    id: "chip_salary",
    topic: "SALARY_NEGOTIATION",
    title: "Market Salary Benchmarks",
    prompt: "What is the expected salary benchmark range for my experience level in Cloud & AI Engineering roles?",
  },
];

export class CareerAgentService {
  /**
   * Hybrid LLM Invocation with fallback to Context Fusion Engine
   */
  private static async invokeExternalLLM(systemContext: string, prompt: string): Promise<string | null> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemContext}\n\nCandidate Question: ${prompt}` }] }],
          }),
        });
        const data = await res.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      } catch (err) {
        console.warn("Gemini LLM API call failed, falling back to Context Fusion Engine:", err);
      }
    }

    if (openaiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemContext },
              { role: "user", content: prompt },
            ],
          }),
        });
        const data = await res.json();
        if (data?.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch (err) {
        console.warn("OpenAI LLM API call failed, falling back to Context Fusion Engine:", err);
      }
    }

    return null;
  }

  /**
   * Processes a candidate prompt using Context Fusion across M02, M07, M10, and M11
   */
  static async processCareerPrompt(userId: string, prompt: string, topic: AdvisorTopic = "GENERAL_CAREER"): Promise<AgentResponse> {
    const { profile, completeness } = await ProfileService.getProfileByUserId(userId);
    const { metrics } = await ApplicationTrackerService.getUserApplications(userId);
    const benchmarks = CareerAnalyticsService.getSalaryBenchmarks("fullstack-ai");
    const candidateTechSkills = profile?.skills?.technicalSkills || [];

    const topSalaryRange = benchmarks.length > 0 ? `${benchmarks[0].minLpa} - ${benchmarks[0].maxLpa} LPA` : "12 - 45 LPA";

    const systemContext = `You are ApplyPilot AI Career Advisor. Candidate PCI Completeness: ${completeness.score}%. Verified Skills: ${candidateTechSkills.length}. Active Applications: ${metrics.totalCount}. Target Salary Range: ${topSalaryRange}.`;

    // Attempt External LLM API Call
    const llmReply = await this.invokeExternalLLM(systemContext, prompt);

    const lowerPrompt = prompt.toLowerCase();
    let reply = llmReply || "";
    let suggestedNextSteps: string[] = [];

    if (!reply) {
      if (topic === "RESUME_ADVICE" || lowerPrompt.includes("resume") || lowerPrompt.includes("ats")) {
        reply = `Based on your **Master Profile (PCI: ${completeness.score}%)**, here is your personalized ATS Resume tuning advice:\n\n` +
          `1. **Highlight Core Skills**: Ensure top skills like ${candidateTechSkills.slice(0, 3).map((s: any) => `\`${s.skillName || s}\``).join(", ") || "`TypeScript`, `React`"} are prominently featured in your summary section.\n` +
          `2. **Quantify Achievements**: Bullet points with metrics (e.g. "Improved API response speed by 40%") rank 35% higher in corporate ATS algorithms.\n` +
          `3. **Document Vault Verification**: Upload your latest verified resume PDF in **Document Vault (M03)** for seamless auto-injection in M08 & M09.`;

        suggestedNextSteps = [
          "Upload updated PDF in Document Vault (M03)",
          "Run Skill Studio analysis (M07) to add missing keywords",
          "Test Pre-fill Strategy in Form Intelligence (M08)",
        ];
      } else if (topic === "INTERVIEW_PREP" || lowerPrompt.includes("interview") || lowerPrompt.includes("mock")) {
        reply = `Here are 3 high-yield mock interview questions tailored to your profile:\n\n` +
          `**Q1 (Architecture)**: How do you handle App Router server-side caching and dynamic route revalidation in Next.js 14?\n` +
          `**Q2 (Data Management)**: Explain how you design MongoDB schema indexes for multi-tenant SaaS applications with high write velocity.\n` +
          `**Q3 (AI Engineering)**: How do you implement robust fallback mechanisms when external LLM endpoints experience latency or timeouts?\n\n` +
          `💡 *Pro Tip*: Practice answering using the **STAR Method** (Situation, Task, Action, Result) for maximum impact.`;

        suggestedNextSteps = [
          "Review Next.js 14 App Router docs",
          "Practice System Design concurrency scenarios",
          "Update interview notes in Candidate ATS (M10)",
        ];
      } else if (topic === "GOVT_EXAM_PREP" || lowerPrompt.includes("ssc") || lowerPrompt.includes("upsc") || lowerPrompt.includes("govt")) {
        reply = `🏛️ **Government Recruitment Preparation Strategy (SSC CGL / UPSC ASO)**:\n\n` +
          `- **Quantitative Aptitude**: Focus 45 mins daily on Geometry, Data Interpretation, and Speed-Time-Distance.\n` +
          `- **General Intelligence & Reasoning**: Solve 30 previous year Tier-1 pattern puzzles daily.\n` +
          `- **English Comprehension**: Practice Cloze Tests and Vocabulary flashcards.\n` +
          `- **Photo & Signature Presets**: Use **Asset Engine (M04)** to auto-resize your candidate photograph to exact SSC specifications (20 KB - 50 KB JPG).`;

        suggestedNextSteps = [
          "Check photo compliance in Asset Studio (M04)",
          "Log exam deadline in Candidate ATS (M10)",
          "Sync Government ASO benchmark in Skill Studio (M07)",
        ];
      } else if (topic === "SALARY_NEGOTIATION" || lowerPrompt.includes("salary") || lowerPrompt.includes("lpa") || lowerPrompt.includes("compensation")) {
        reply = `📊 **Market Compensation & Salary Negotiation Benchmarks (M11 Analytics)**:\n\n` +
          `- **Fullstack AI Engineer**: **₹12 LPA (Min) | ₹24 LPA (Median) | ₹45 LPA (Max)** (Demand: VERY_HIGH)\n` +
          `- **Backend & Cloud Architect**: **₹16 LPA (Min) | ₹30 LPA (Median) | ₹55 LPA (Max)** (Demand: VERY_HIGH)\n` +
          `- **ML & AI Specialist**: **₹18 LPA (Min) | ₹32 LPA (Median) | ₹60 LPA (Max)** (Demand: VERY_HIGH)\n\n` +
          `💡 *Negotiation Strategy*: Always negotiate based on value delivered and verified skill indices rather than past salary history alone.`;

        suggestedNextSteps = [
          "View full Salary Benchmarks in Career Analytics (M11)",
          "Update target salary expectation in Master Profile (M02)",
          "Review top paying Job Matches (M06)",
        ];
      } else {
        reply = `Greetings! As your **ApplyPilot AI Career Advisor**, I analyzed your active career profile:\n\n` +
          `- **Master Profile Completeness**: **${completeness.score}%**\n` +
          `- **Logged Applications**: **${metrics.totalCount}** active entries in Candidate ATS\n` +
          `- **Active Skill Index**: **${candidateTechSkills.length}** technical skills verified\n` +
          `- **Target Salary Benchmark**: **${topSalaryRange}**\n\n` +
          `I am ready to help you optimize your resume, prepare for technical interviews, analyze skill gaps, or plan government exam roadmaps. What goal would you like to focus on today?`;

        suggestedNextSteps = [
          "Ask for ATS Resume Tuning Advice",
          "Generate Mock Interview Questions",
          "Explore Target Role Salary Trends (M11)",
        ];
      }
    } else {
      suggestedNextSteps = [
        "Ask follow-up question to AI Advisor",
        "View active Job Matches (M06)",
        "Check Skill Gap Analysis (M07)",
      ];
    }

    return {
      reply,
      topic,
      contextSummary: {
        pciScore: completeness.score,
        skillsCount: candidateTechSkills.length,
        activeApplicationsCount: metrics.totalCount,
        topSalaryRangeLpa: topSalaryRange,
      },
      suggestedNextSteps,
    };
  }

  /**
   * Retrieves starter quick-prompt chips
   */
  static getRecommendedPromptChips(): PromptChip[] {
    return RECOMMENDED_PROMPT_CHIPS;
  }
}
