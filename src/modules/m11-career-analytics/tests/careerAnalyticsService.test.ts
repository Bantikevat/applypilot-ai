import { describe, it, expect } from "vitest";
import { analyticsFilterSchema } from "../schemas/analyticsSchemas";
import { CareerAnalyticsService } from "../services/careerAnalyticsService";

describe("M11 — Career Analytics & Market Intelligence Unit & Service Tests", () => {
  it("should validate analytics query schema correctly", () => {
    const validReq = { timeframe: "ALL_TIME" as const, portalCategory: "ALL" as const };
    const res = analyticsFilterSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should compute candidate career analytics overview cleanly", async () => {
    const userId = "test_analytics_user_1";

    const overview = await CareerAnalyticsService.getAnalyticsOverview(userId);

    expect(overview).toBeDefined();
    expect(overview.profileCompletenessScore).toBeGreaterThanOrEqual(0);
    expect(overview.conversionFunnel.length).toBe(5);
    expect(overview.portalPerformance.length).toBe(3);
    expect(overview.topSalaryBenchmarks.length).toBeGreaterThan(0);
  });

  it("should retrieve specific salary benchmark for backend-cloud-architect", () => {
    const benchmarks = CareerAnalyticsService.getSalaryBenchmarks("backend-cloud-architect");

    expect(benchmarks.length).toBe(1);
    expect(benchmarks[0].roleTitle).toContain("Backend");
    expect(benchmarks[0].minLpa).toBe(16);
    expect(benchmarks[0].maxLpa).toBe(55);
  });
});
