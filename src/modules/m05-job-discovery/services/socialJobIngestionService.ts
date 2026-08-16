import { JobDiscoveryService } from "./jobDiscoveryService";
import { CanonicalJobInput } from "../schemas/jobDiscoverySchemas";

export interface RawSocialJobMessage {
  source: "WHATSAPP" | "TELEGRAM";
  groupName?: string;
  senderName?: string;
  messageText: string;
  receivedAt?: string;
}

export class SocialJobIngestionService {
  /**
   * Parses raw WhatsApp or Telegram job posts using RegEx NLP parser
   * Extracts Job Title, Company, Apply Link, Location, and Salary
   */
  static parseSocialJobPost(raw: RawSocialJobMessage): CanonicalJobInput | null {
    const text = raw.messageText || "";
    if (text.length < 15) return null;

    // RegEx Patterns for Job Post Ingestion
    const titleMatch = text.match(/(?:role|title|position|hiring for|job|profile)\s*:\s*([^\n\r.]+)/i) ||
                       text.match(/(?:looking for|hiring)\s+(?:a|an)?\s*([^\n\r.]+)/i);

    const companyMatch = text.match(/(?:company|organization|client)\s*:\s*([^\n\r.]+)/i) ||
                         text.match(/at\s+([A-Za-z0-9\s.&]{2,30})/i);

    const linkMatch = text.match(/(https?:\/\/[^\s]+)/gi) || text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi);

    const locationMatch = text.match(/(?:location|city|place|mode)\s*:\s*([^\n\r.]+)/i) ||
                          text.match(/(remote|hybrid|ujjain|bhopal|bangalore|delhi|mumbai|pune|indore)/i);

    const salaryMatch = text.match(/(?:salary|ctc|package|stipend)\s*:\s*([^\n\r.]+)/i) ||
                        text.match(/(\d+\s*-\s*\d+\s*(?:lpa|lakhs|k|pm))/i);

    let extractedTitle = "Software Engineer / Tech Role";
    if (titleMatch) {
      const matchVal = titleMatch[1] || titleMatch[2] || titleMatch[0];
      extractedTitle = matchVal
        .replace(/^(urgent|hiring|job|role|position|profile)\s*:?\s*/i, "")
        .split(".")[0]
        .split("at ")[0]
        .trim();
    }

    let extractedCompany = raw.groupName || "Tech Hire Partner";
    if (companyMatch) {
      const matchVal = companyMatch[1] || companyMatch[0];
      extractedCompany = matchVal.split(".")[0].trim();
    }

    const extractedLink = linkMatch ? linkMatch[0] : "https://applypilot.ai/jobs";

    let extractedLocation = "Remote / Hybrid";
    if (locationMatch) {
      const matchVal = locationMatch[1] || locationMatch[0];
      extractedLocation = matchVal.split(".")[0].trim();
    }

    const jobInput: CanonicalJobInput = {
      externalJobId: `${raw.source.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: extractedTitle,
      company: extractedCompany,
      location: extractedLocation,
      employmentType: text.toLowerCase().includes("contract") ? "Contract" : "Full-time",
      workMode: text.toLowerCase().includes("remote") ? "Remote" : text.toLowerCase().includes("hybrid") ? "Hybrid" : "On-site",
      sourceCategory: "SPECIALIZED_REMOTE",
      sourceAdapter: raw.source === "WHATSAPP" ? "WhatsApp Job Groups" : "Telegram Job Channels",
      sourceUrl: extractedLink,
      description: text,
      postedAt: raw.receivedAt || new Date().toISOString(),
      rawPayload: {
        source: raw.source,
        groupName: raw.groupName || "Job Alert Group",
        senderName: raw.senderName || "Recruiter",
        salaryExtracted: salaryMatch ? salaryMatch[0] : undefined,
      },
    };

    return jobInput;
  }

  /**
   * Ingests a raw WhatsApp or Telegram job message and creates a canonical job entry
   */
  static async ingestSocialJob(raw: RawSocialJobMessage) {
    const jobInput = this.parseSocialJobPost(raw);
    if (!jobInput) {
      return { success: false, message: "Invalid or short job message" };
    }

    const job = await JobDiscoveryService.ingestCanonicalJob(jobInput);
    return { success: true, job };
  }

  /**
   * Sample WhatsApp & Telegram Feed Sync for Demonstration
   */
  static async syncSampleSocialFeeds() {
    const samplePosts: RawSocialJobMessage[] = [
      {
        source: "WHATSAPP",
        groupName: "MERN Stack Job Hiring India 🇮🇳",
        senderName: "HR Byteflow",
        messageText: "Hiring Urgent: Senior MERN Developer at TechFlow Solutions. Location: Remote / Bhopal. Salary: 15 LPA. Apply link: https://careers.techflow.io/mern-dev",
      },
      {
        source: "TELEGRAM",
        groupName: "AI & Fullstack Job Alerts Channel",
        senderName: "TechRecruiterBot",
        messageText: "Role: Fullstack AI Engineer. Company: Neural Cloud Labs. Location: Hybrid / Remote. Looking for candidates with Next.js, Python, LLM Prompting & Node.js skills. Apply at: hr@neuralcloud.ai",
      },
      {
        source: "WHATSAPP",
        groupName: "Ujjain & Bhopal Tech Opportunities",
        senderName: "Placement Cell",
        messageText: "Position: Next.js Frontend Developer. Client: Alpine Tech Systems. Experience: 1-3 Years. Send CV to jobs@alpinetech.com or apply at https://alpinetech.com/careers",
      },
    ];

    const ingestedJobs = [];
    for (const post of samplePosts) {
      const res = await this.ingestSocialJob(post);
      if (res.success && res.job) {
        ingestedJobs.push(res.job);
      }
    }

    return ingestedJobs;
  }
}
