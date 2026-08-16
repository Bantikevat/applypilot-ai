import { describe, it, expect } from "vitest";
import { triggerSyncSchema } from "../schemas/adminSchemas";
import { AdminConsoleService } from "../services/adminConsoleService";

describe("M14 — Master Admin Console Unit & Service Tests", () => {
  it("should validate trigger sync schema correctly", () => {
    const validReq = { adapterId: "govt-ssc-upsc" };
    const res = triggerSyncSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should return system health overview & 4-category scraper adapter metrics", async () => {
    const overview = await AdminConsoleService.getSystemHealthOverview();

    expect(overview).toBeDefined();
    expect(overview.databaseStatus).toBeDefined();
    expect(overview.adaptersHealth.length).toBe(4);
    expect(overview.apiUptimePercentage).toBeGreaterThan(90);
  });

  it("should return candidate user audit list", async () => {
    const audits = await AdminConsoleService.getCandidateAuditList();

    expect(audits).toBeDefined();
    expect(audits.length).toBeGreaterThan(0);
    expect(audits[0].userId).toBeDefined();
  });

  it("should trigger manual adapter sync successfully", async () => {
    const result = await AdminConsoleService.triggerAdapterSync("all");

    expect(result.success).toBe(true);
    expect(result.syncedCount).toBeGreaterThanOrEqual(0);
    expect(result.message).toContain("Manual sync executed cleanly");
  }, 30000);
});
