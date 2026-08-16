import { describe, it, expect } from "vitest";
import { triggerSyncSchema, userQuerySchema } from "../schemas/adminSchemas";
import { AdminConsoleService } from "../services/adminConsoleService";

describe("M14 — Master Admin Console Unit & Service Tests", () => {
  it("should validate trigger sync input schema correctly", () => {
    const validReq = { adapterId: "govt-ssc-upsc" as const };
    const res = triggerSyncSchema.safeParse(validReq);
    expect(res.success).toBe(true);
  });

  it("should return system health overview & scraper adapter metrics", async () => {
    const health = await AdminConsoleService.getSystemHealthOverview();

    expect(health).toBeDefined();
    expect(health.databaseStatus).toBeDefined();
    expect(health.apiUptimePercentage).toBe(99.9);
    expect(health.adaptersHealth.length).toBeGreaterThan(0);
    expect(health.adaptersHealth[0].status).toBe("HEALTHY");
  });

  it("should return candidate user audit list", async () => {
    const users = await AdminConsoleService.getCandidateAuditList();

    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].userId).toBeDefined();
    expect(users[0].email).toBeDefined();
  });

  it("should trigger manual adapter sync successfully", async () => {
    const res = await AdminConsoleService.triggerAdapterSync("govt-ssc-upsc");

    expect(res.success).toBe(true);
    expect(res.syncedCount).toBeGreaterThanOrEqual(0);
  }, 30000);
});
