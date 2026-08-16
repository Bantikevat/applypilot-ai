import { describe, it, expect } from "vitest";
import { chatMessageInputSchema } from "../schemas/agentSchemas";
import { CareerAgentService } from "../services/careerAgentService";

describe("M12 — AI Career Agent Unit & Service Tests", () => {
  it("should validate chat message input schema correctly", () => {
    const validReq = {
      prompt: "How can I improve my resume?",
      topic: "RESUME_ADVICE" as const,
    };
    const res = chatMessageInputSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should process candidate prompt with context fusion across M02, M07, M10, and M11", async () => {
    const userId = "test_agent_user_1";
    const result = await CareerAgentService.processCareerPrompt(
      userId,
      "Give me interview preparation advice for Senior AI role.",
      "INTERVIEW_PREP"
    );

    expect(result).toBeDefined();
    expect(result.reply).toContain("Q1");
    expect(result.contextSummary).toBeDefined();
    expect(result.suggestedNextSteps.length).toBeGreaterThan(0);
  });

  it("should process salary negotiation prompt and return M11 market benchmarks", async () => {
    const userId = "test_agent_user_2";
    const result = await CareerAgentService.processCareerPrompt(
      userId,
      "What is the expected salary benchmark range for my experience level?",
      "SALARY_NEGOTIATION"
    );

    expect(result).toBeDefined();
    expect(result.reply).toContain("Salary Negotiation Benchmarks");
    expect(result.reply).toContain("Fullstack AI Engineer");
    expect(result.suggestedNextSteps.length).toBeGreaterThan(0);
  });

  it("should return starter recommended prompt chips", () => {
    const chips = CareerAgentService.getRecommendedPromptChips();
    expect(chips.length).toBeGreaterThan(0);
    expect(chips[0].id).toBeDefined();
  });
});
