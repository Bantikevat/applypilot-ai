import { describe, it, expect } from "vitest";
import { analyticsFilterSchema, salaryTrendQuerySchema } from "../schemas/analyticsSchemas";
import { CareerAnalyticsService } from "../services/careerAnalyticsService";

describe("M11 — Career Analytics & Market Intelligence Unit & Service Tests", () => {
  it("should validate analytics filter schema correctly", () => {
    const validReq = { timeframe: "ALL_TIME" as const, portalCategory: "Corporate" as const };
    const res = analyticsFilterSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should return salary benchmarks for target roles", () => {
    const benchmarks = CareerAnalyticsService.getSalaryBenchmarks("fullstack-ai");

    expect(benchmarks.length).toBe(1);
    expect(benchmarks[0].roleTitle).toBe("Fullstack AI Engineer");
    expect(benchmarks[0].minLpa).toBe(12);
    expect(benchmarks[0].medianLpa).toBe(24);
  });

  it("should compute candidate career analytics overview cleanly", async () => {
    const userId = "test_analytics_user_123";
    const analytics = await CareerAnalyticsService.getAnalyticsOverview(userId);

    expect(analytics).toBeDefined();
    expect(analytics.conversionFunnel.length).toBe(4);
    expect(analytics.portalPerformance.length).toBe(3);
    expect(analytics.topSalaryBenchmarks.length).toBeGreaterThan(0);
  });
});
