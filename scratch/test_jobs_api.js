const { JobDiscoveryService } = require("../src/modules/m05-job-discovery/services/jobDiscoveryService");

async function testJobsApi() {
  try {
    const res = await JobDiscoveryService.searchJobs({ sourceCategory: "WhatsApp & Telegram", page: 1, limit: 12 });
    console.log("SUCCESS WhatsApp & Telegram Jobs found:", res.jobs.length);
    console.log(JSON.stringify(res.jobs, null, 2));
  } catch (err) {
    console.error("ERROR testing searchJobs:", err);
  }
}

testJobsApi();
