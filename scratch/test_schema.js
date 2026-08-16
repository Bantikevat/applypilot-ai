const { jobSearchQuerySchema } = require("../src/modules/m05-job-discovery/schemas/jobSchemas");

try {
  const parsed = jobSearchQuerySchema.parse({ sourceCategory: "WhatsApp & Telegram" });
  console.log("Parsed Query successfully:", parsed);
} catch (err) {
  console.error("Zod Parse Error:", err);
}
