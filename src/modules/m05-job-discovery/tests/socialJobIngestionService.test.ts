import { describe, it, expect } from "vitest";
import { SocialJobIngestionService } from "../services/socialJobIngestionService";

describe("SocialJobIngestionService — WhatsApp & Telegram Job Ingestion", () => {
  it("should parse incoming WhatsApp job post text cleanly", () => {
    const rawPost = {
      source: "WHATSAPP" as const,
      groupName: "Senior MERN Stack Jobs India",
      senderName: "HR Byteflow",
      messageText: "Hiring Urgent: Senior MERN Developer at TechFlow Solutions. Location: Remote / Bhopal. Salary: 15 LPA. Apply link: https://careers.techflow.io/mern-dev",
    };

    const parsed = SocialJobIngestionService.parseSocialJobPost(rawPost);
    expect(parsed).toBeDefined();
    expect(parsed?.title).toBe("Senior MERN Developer");
    expect(parsed?.company).toBe("TechFlow Solutions");
    expect(parsed?.location).toBe("Remote / Bhopal");
    expect(parsed?.sourceAdapter).toBe("WhatsApp Job Groups");
    expect(parsed?.sourceUrl).toBe("https://careers.techflow.io/mern-dev");
  });

  it("should parse incoming Telegram channel job post text cleanly", () => {
    const rawPost = {
      source: "TELEGRAM" as const,
      groupName: "AI & Fullstack Job Alerts",
      senderName: "TechBot",
      messageText: "Role: Fullstack AI Engineer. Company: Neural Cloud Labs. Location: Hybrid / Remote. Looking for candidates with Next.js & Python skills. Apply at: hr@neuralcloud.ai",
    };

    const parsed = SocialJobIngestionService.parseSocialJobPost(rawPost);
    expect(parsed).toBeDefined();
    expect(parsed?.title).toBe("Fullstack AI Engineer");
    expect(parsed?.company).toBe("Neural Cloud Labs");
    expect(parsed?.sourceAdapter).toBe("Telegram Job Channels");
  });
});
