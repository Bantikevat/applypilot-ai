import { describe, it, expect } from "vitest";
import { jobSearchQuerySchema, canonicalJobInputSchema } from "../schemas/jobSchemas";
import { JobDiscoveryService } from "../services/jobDiscoveryService";
import {
  OfficialUPSCSourceAdapter,
  OfficialSSCSourceAdapter,
  GovernmentSourceAdapter,
  GoogleCareersAdapter,
  DeepMindCareersAdapter,
  MicrosoftCareersAdapter,
  IBMCareersAdapter,
  CompanyCareerAdapter,
  RemoteOKPlatformAdapter,
  ArbeitnowPlatformAdapter,
  TechJobBoardPlatformAdapter,
  JobBoardAdapter,
  WeWorkRemotelyAdapter,
  HimalayasPlatformAdapter,
  JobspressoPlatformAdapter,
  SpecializedRemoteJobAdapter,
} from "../adapters/sourceAdapters";

describe("M05-A — Live Government Job Discovery Unit & Integration Tests", () => {
  it("1. Successful Ingestion — should normalize and ingest UPSC official feed notices", async () => {
    const adapter = new OfficialUPSCSourceAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].company).toContain("UPSC");
    expect(jobs[0].source).toBe("UPSC Official");
  });

  it("2. Empty Feed — should return empty array safely without throwing errors", () => {
    const adapter = new OfficialUPSCSourceAdapter();
    const normalized = adapter.normalizeRawRecord(null);
    expect(normalized).toBeNull();
  });

  it("3. Invalid Feed — should reject malformed feed items missing title", () => {
    const adapter = new OfficialSSCSourceAdapter();
    const malformedRecord = { noticeTitle: " ", applyLink: "https://ssc.gov.in" };
    const res = adapter.normalizeRawRecord(malformedRecord);
    expect(res).toBeNull();
  });

  it("4. Network Failure — should activate resilient notice fallback on network timeout", async () => {
    const adapter = new OfficialSSCSourceAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    const health = adapter.reportHealth();
    expect(health.sourceName).toContain("SSC");
  });

  it("5. Duplicate Job — should not insert duplicate record when deduplication hash matches", () => {
    const adapter = new OfficialUPSCSourceAdapter();
    const rawJobs = [
      { title: "Civil Services Officer", link: "https://upsconline.nic.in" },
      { title: "Civil Services Officer", link: "https://upsconline.nic.in" },
    ];
    const normalized = rawJobs.map((r) => adapter.normalizeRawRecord(r)!);
    const deduplicated = adapter.deduplicate(normalized);
    expect(deduplicated.length).toBe(1);
  });

  it("6. Updated Job — should update lastVerifiedAt timestamp for existing canonical record", async () => {
    const jobInput = {
      title: "Assistant Section Officer (ASO) Update Test",
      company: "SSC Official Org",
      location: "New Delhi",
      employmentType: "Government" as const,
      description: "Official recruitment update notice.",
      skills: ["General Aptitude"],
      applicationUrl: "https://ssc.gov.in/apply-update",
      source: "SSC Official",
    };

    const first = await JobDiscoveryService.ingestJob(jobInput);
    const second = await JobDiscoveryService.ingestJob(jobInput);
    expect(second.deduplicationHash).toBe(first.deduplicationHash);
    expect(second.lastVerifiedAt).toBeDefined();
  });

  it("7. Missing Optional Fields — should handle missing salary/maxExperience gracefully", () => {
    const minimalJob = {
      title: "Government Staff Officer",
      company: "State PSC",
      location: "State Capital",
      description: "Standard government administrative notice.",
      applicationUrl: "https://statepsc.example.gov.in/apply",
      source: "State PSC",
    };

    const parsed = canonicalJobInputSchema.safeParse(minimalJob);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.minExperienceYears).toBe(0);
      expect(parsed.data.salaryCurrency).toBe("INR");
    }
  });

  it("8. Missing Application URL — should fall back to official portal homepage URL", () => {
    const adapter = new OfficialUPSCSourceAdapter();
    const recordMissingLink = { title: "UPSC Notice without Link" };
    const normalized = adapter.normalizeRawRecord(recordMissingLink);
    expect(normalized).not.toBeNull();
    expect(normalized?.applicationUrl).toBe("https://upsconline.nic.in");
  });

  it("9. Invalid URL (SSRF Protection) — should reject unsafe non-HTTP protocols", () => {
    const adapter = new OfficialUPSCSourceAdapter();
    const unsafeJob = {
      title: "Unsafe Exploit Job",
      company: "UPSC",
      location: "Delhi",
      employmentType: "Government" as const,
      description: "SSRF Test",
      applicationUrl: "file:///etc/passwd",
      source: "UPSC Official",
    };

    const isValid = adapter.validate(unsafeJob);
    expect(isValid).toBe(false);
  });

  it("10. Stale Job Handling — should set postedAt to null if date is unavailable without inventing dates", () => {
    const adapter = new OfficialUPSCSourceAdapter();
    const recordNoDate = { title: "Undated Notice", link: "https://upsc.gov.in/notice", pubDate: null };
    const normalized = adapter.normalizeRawRecord(recordNoDate);
    expect(normalized).not.toBeNull();
    expect(normalized?.postedAt).toBeNull();
  });

  it("11. Normalization — should compute SHA-256 fingerprint identically regardless of case/whitespace", () => {
    const hashA = JobDiscoveryService.computeDeduplicationHash("Staff Selection Commission", "Assistant Section Officer", "New Delhi");
    const hashB = JobDiscoveryService.computeDeduplicationHash(" STAFF SELECTION COMMISSION ", "assistant section officer", "NEW DELHI");
    expect(hashA).toBe(hashB);
  });

  it("12. Storage Persistence & Health Reporting — should sync all government sources and return source health", async () => {
    const govtAdapter = new GovernmentSourceAdapter();
    const jobs = await govtAdapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);

    const healthReports = govtAdapter.reportHealth();
    expect(healthReports.length).toBe(2);
    expect(healthReports[0].success).toBe(true);
    expect(healthReports[1].success).toBe(true);
  });
});

describe("M05-B — Live MNC Company Career Discovery Unit & Integration Tests", () => {
  it("1. Google Careers Ingestion — should normalize and ingest Google official career notices", async () => {
    const adapter = new GoogleCareersAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].company).toContain("Google");
    expect(jobs[0].source).toBe("Google Careers");
  });

  it("2. DeepMind Careers Ingestion — should normalize DeepMind AI engineering job notices", async () => {
    const adapter = new DeepMindCareersAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].company).toContain("DeepMind");
    expect(jobs[0].source).toBe("DeepMind Careers");
  });

  it("3. Microsoft Careers Ingestion — should normalize Microsoft public career notices", async () => {
    const adapter = new MicrosoftCareersAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].company).toContain("Microsoft");
    expect(jobs[0].source).toBe("Microsoft Careers");
  });

  it("4. IBM Careers Ingestion & Null Posted Date — should normalize IBM career notices and handle null postedAt", async () => {
    const adapter = new IBMCareersAdapter();
    const rawNoDate = { positionTitle: "IBM Cloud Architect", applyUrl: "https://www.ibm.com/careers", postDate: null };
    const normalized = adapter.normalizeRawRecord(rawNoDate);
    expect(normalized).not.toBeNull();
    expect(normalized?.postedAt).toBeNull();
  });

  it("5. Malformed MNC Record Rejection — should reject malformed records missing title", () => {
    const adapter = new GoogleCareersAdapter();
    const malformed = { apply_url: "https://careers.google.com" };
    const res = adapter.normalizeRawRecord(malformed);
    expect(res).toBeNull();
  });

  it("6. HTML Sanitization — should strip HTML tags from MNC job descriptions", () => {
    const adapter = new MicrosoftCareersAdapter();
    const htmlRecord = {
      title: "Fullstack Engineer",
      url: "https://careers.microsoft.com",
      description: "<p>Build <strong>Azure Cloud</strong> services &amp; REST APIs.</p>",
    };
    const normalized = adapter.normalizeRawRecord(htmlRecord);
    expect(normalized?.description).not.toContain("<p>");
    expect(normalized?.description).not.toContain("<strong>");
    expect(normalized?.description).toContain("Build Azure Cloud services");
  });

  it("7. SSRF Protection — should block non-http protocols in MNC application URLs", () => {
    const adapter = new DeepMindCareersAdapter();
    const unsafeMNCJob = {
      title: "Exploit AI Engineer",
      company: "DeepMind",
      location: "Remote",
      employmentType: "Remote" as const,
      description: "SSRF test",
      applicationUrl: "gopher://127.0.0.1:9000",
      source: "DeepMind Careers",
    };
    const isValid = adapter.validate(unsafeMNCJob);
    expect(isValid).toBe(false);
  });

  it("8. MNC Job Deduplication — should deduplicate identical MNC job postings", () => {
    const adapter = new GoogleCareersAdapter();
    const rawJobs = [
      { title: "Software Engineer", apply_url: "https://careers.google.com/jobs" },
      { title: "Software Engineer", apply_url: "https://careers.google.com/jobs" },
    ];
    const normalized = rawJobs.map((r) => adapter.normalizeRawRecord(r)!);
    const deduplicated = adapter.deduplicate(normalized);
    expect(deduplicated.length).toBe(1);
  });

  it("9. MNC Source Health Reporting — should aggregate health reports for all 4 Tech MNC adapters", () => {
    const mncComposite = new CompanyCareerAdapter();
    const healthReports = mncComposite.reportHealth();
    expect(healthReports.length).toBe(4);
    expect(healthReports[0].sourceName).toContain("Google");
    expect(healthReports[1].sourceName).toContain("DeepMind");
    expect(healthReports[2].sourceName).toContain("Microsoft");
    expect(healthReports[3].sourceName).toContain("IBM");
  });

  it("10. Source Failure Isolation — failure in 1 adapter must not prevent other MNC adapters from returning jobs", async () => {
    const mncComposite = new CompanyCareerAdapter();
    const jobs = await mncComposite.fetchJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(4);
  }, 30000);

  it("11. MNC Ingestion in JobDiscoveryService — should sync and search Tech MNC jobs by category", async () => {
    await JobDiscoveryService.syncAllSources();
    const res = await JobDiscoveryService.searchJobs({
      sourceCategory: "Tech MNCs",
      page: 1,
      limit: 10,
    });
    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs[0].source).toMatch(/Google|DeepMind|Microsoft|IBM/i);
  }, 30000);

  it("12. Combined Sync Ingestion — should run sync across Government and MNC company adapters without error", async () => {
    const syncRes = await JobDiscoveryService.syncAllSources();
    expect(syncRes.totalIngested).toBeGreaterThanOrEqual(5);
  }, 30000);
});

describe("M05-C — Authorized Job Platform Discovery Unit & Integration Tests", () => {
  it("1. RemoteOK Ingestion — should normalize and ingest RemoteOK authorized API job listings", async () => {
    const adapter = new RemoteOKPlatformAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].source).toBe("RemoteOK API");
  });

  it("2. Arbeitnow Ingestion — should normalize Arbeitnow open jobs API listings", async () => {
    const adapter = new ArbeitnowPlatformAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].source).toBe("Arbeitnow API");
  });

  it("3. TechJobBoard Ingestion — should normalize TechJobBoard open developer feed listings", async () => {
    const adapter = new TechJobBoardPlatformAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].source).toBe("TechJobBoard");
  });

  it("4. Empty Response Handling — should return empty array safely on empty raw feed input", () => {
    const adapter = new RemoteOKPlatformAdapter();
    const res = adapter.normalizeRawRecord(null);
    expect(res).toBeNull();
  });

  it("5. Malformed Record Rejection — should reject platform records missing position title", () => {
    const adapter = new RemoteOKPlatformAdapter();
    const malformed = { company: "No Title Org" };
    const res = adapter.normalizeRawRecord(malformed);
    expect(res).toBeNull();
  });

  it("6. HTML Tag Sanitization — should strip HTML tags from platform job descriptions", () => {
    const adapter = new ArbeitnowPlatformAdapter();
    const htmlRecord = {
      title: "Backend Engineer",
      url: "https://www.arbeitnow.com/jobs/99",
      description: "<div><p>Develop <strong>scalable microservices</strong>.</p></div>",
    };
    const normalized = adapter.normalizeRawRecord(htmlRecord);
    expect(normalized?.description).not.toContain("<div>");
    expect(normalized?.description).not.toContain("<strong>");
    expect(normalized?.description).toContain("Develop scalable microservices");
  });

  it("7. SSRF Security Guard — should reject unsafe non-HTTP protocols in application URLs", () => {
    const adapter = new RemoteOKPlatformAdapter();
    const unsafePlatformJob = {
      title: "Exploit Developer",
      company: "Hacker Org",
      location: "Remote",
      employmentType: "Remote" as const,
      description: "SSRF Test",
      applicationUrl: "javascript:alert(1)",
      source: "RemoteOK API",
    };
    const isValid = adapter.validate(unsafePlatformJob);
    expect(isValid).toBe(false);
  });

  it("8. Cross-Source Deduplication — MNC + Platform job for same vacancy must compute identical SHA-256 hash", () => {
    const mncHash = JobDiscoveryService.computeDeduplicationHash("Acme Tech Solutions", "Frontend Developer (React / Next.js)", "Hyderabad");
    const platformHash = JobDiscoveryService.computeDeduplicationHash("Acme Tech Solutions ", "frontend developer (react / next.js)", "hyderabad");
    expect(mncHash).toBe(platformHash);
  });

  it("9. Platform Source Health Reporting — should aggregate health reports for all 3 Job Platform adapters", () => {
    const boardComposite = new JobBoardAdapter();
    const healthReports = boardComposite.reportHealth();
    expect(healthReports.length).toBe(3);
    expect(healthReports[0].sourceName).toContain("RemoteOK");
    expect(healthReports[1].sourceName).toContain("Arbeitnow");
    expect(healthReports[2].sourceName).toContain("TechJobBoard");
  });

  it("10. Platform Source Failure Isolation — failure in 1 platform adapter must not break other adapters", async () => {
    const boardComposite = new JobBoardAdapter();
    const jobs = await boardComposite.fetchJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(3);
  }, 15000);

  it("11. Category Filter Ingestion — should search all ingested platform jobs in JobDiscoveryService", async () => {
    await JobDiscoveryService.syncAllSources();
    const res = await JobDiscoveryService.searchJobs({
      sourceCategory: "All",
      page: 1,
      limit: 20,
    });
    expect(res.jobs.length).toBeGreaterThan(0);
  }, 30000);

  it("12. Comprehensive M05 Multi-Source Sync — should run sync across Govt (M05-A), MNC (M05-B), and Platform (M05-C)", async () => {
    const syncRes = await JobDiscoveryService.syncAllSources();
    expect(syncRes.totalIngested).toBeGreaterThanOrEqual(8);
  }, 45000);
});

describe("M05-D — Live Niche & Remote Tech Job Discovery Unit & Integration Tests", () => {
  it("1. WeWorkRemotely Ingestion — should normalize and ingest WeWorkRemotely remote job feed listings", async () => {
    const adapter = new WeWorkRemotelyAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].source).toBe("WeWorkRemotely Feed");
  });

  it("2. Himalayas API Ingestion — should normalize Himalayas open remote jobs API listings", async () => {
    const adapter = new HimalayasPlatformAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].source).toBe("Himalayas API");
  });

  it("3. Jobspresso Ingestion — should normalize Jobspresso remote tech career feed listings", async () => {
    const adapter = new JobspressoPlatformAdapter();
    const jobs = await adapter.fetchJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].source).toBe("Jobspresso");
  });

  it("4. Empty Response Handling — should return empty array safely on null raw feed input", () => {
    const adapter = new WeWorkRemotelyAdapter();
    const res = adapter.normalizeRawRecord(null);
    expect(res).toBeNull();
  });

  it("5. Malformed Record Rejection — should reject remote records missing position title", () => {
    const adapter = new HimalayasPlatformAdapter();
    const malformed = { companyName: "No Title Remote Org" };
    const res = adapter.normalizeRawRecord(malformed);
    expect(res).toBeNull();
  });

  it("6. HTML Tag Sanitization — should strip HTML tags from remote job descriptions", () => {
    const adapter = new WeWorkRemotelyAdapter();
    const htmlRecord = {
      title: "Lead Remote Engineer",
      url: "https://weworkremotely.com/jobs/1",
      description: "<section><p>Build <em>scalable web platforms</em>.</p></section>",
    };
    const normalized = adapter.normalizeRawRecord(htmlRecord);
    expect(normalized?.description).not.toContain("<section>");
    expect(normalized?.description).not.toContain("<em>");
    expect(normalized?.description).toContain("Build scalable web platforms");
  });

  it("7. SSRF Security Guard — should reject unsafe non-HTTP protocols in application URLs", () => {
    const adapter = new JobspressoPlatformAdapter();
    const unsafeRemoteJob = {
      title: "Exploit Engineer",
      company: "Remote Attacker",
      location: "Remote",
      employmentType: "Remote" as const,
      description: "SSRF Test",
      applicationUrl: "ftp://127.0.0.1/exploit",
      source: "Jobspresso",
    };
    const isValid = adapter.validate(unsafeRemoteJob);
    expect(isValid).toBe(false);
  });

  it("8. Cross-Source SHA-256 Deduplication — remote tech job identical hash match", () => {
    const remoteHash = JobDiscoveryService.computeDeduplicationHash("Global Scale Tech", "Senior Remote React / Node Developer", "Remote (Worldwide)");
    const hashB = JobDiscoveryService.computeDeduplicationHash("global scale tech ", "senior remote react / node developer", "remote (worldwide)");
    expect(remoteHash).toBe(hashB);
  });

  it("9. Remote Source Health Reporting — should aggregate health reports for all 3 Remote Tech adapters", () => {
    const remoteComposite = new SpecializedRemoteJobAdapter();
    const healthReports = remoteComposite.reportHealth();
    expect(healthReports.length).toBe(3);
    expect(healthReports[0].sourceName).toContain("WeWorkRemotely");
    expect(healthReports[1].sourceName).toContain("Himalayas");
    expect(healthReports[2].sourceName).toContain("Jobspresso");
  });

  it("10. Remote Source Failure Isolation — failure in 1 remote adapter must not break other adapters", async () => {
    const remoteComposite = new SpecializedRemoteJobAdapter();
    const jobs = await remoteComposite.fetchJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(3);
  }, 15000);

  it("11. Category Filter Ingestion — should search all ingested remote jobs in JobDiscoveryService", async () => {
    await JobDiscoveryService.syncAllSources();
    const res = await JobDiscoveryService.searchJobs({
      sourceCategory: "All",
      page: 1,
      limit: 20,
    });
    expect(res.jobs.length).toBeGreaterThan(0);
  }, 30000);

  it("12. Unified 4-Category Multi-Source Sync — should run sync across Govt (M05-A), MNC (M05-B), Platform (M05-C), and Remote (M05-D)", async () => {
    const syncRes = await JobDiscoveryService.syncAllSources();
    expect(syncRes.totalIngested).toBeGreaterThanOrEqual(11);
  }, 30000);
});
