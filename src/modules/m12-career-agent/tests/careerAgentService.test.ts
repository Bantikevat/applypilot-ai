import { describe, it, expect } from "vitest";
import { chatMessageInputSchema } from "../schemas/agentSchemas";
import { CareerAgentService } from "../services/careerAgentService";

describe("M12 — AI Career Agent Unit & Service Tests", () => {
  it("should validate chat message input schema correctly", () => {
    const validReq = { prompt: "How can I improve my ATS score?", topic: "RESUME_ADVICE" as const };
    const res = chatMessageInputSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should return pre-configured starter prompt chips", () => {
    const chips = CareerAgentService.getRecommendedPromptChips();

    expect(chips.length).toBeGreaterThan(0);
    expect(chips[0].id).toBeDefined();
    expect(chips[0].prompt).toBeDefined();
  });

  it("should process candidate prompt with context fusion", async () => {
    const userId = "test_advisor_user_123";
    const res = await CareerAgentService.processCareerPrompt(
      userId,
      "Give me mock interview questions for fullstack AI engineer",
      "INTERVIEW_PREP"
    );

    expect(res).toBeDefined();
    expect(res.reply).toContain("Q1");
    expect(res.contextSummary).toBeDefined();
    expect(res.contextSummary.pciScore).toBeGreaterThanOrEqual(0);
    expect(res.suggestedNextSteps.length).toBeGreaterThan(0);
  });
});
