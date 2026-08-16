const { SocialJobIngestionService } = require("../src/modules/m05-job-discovery/services/socialJobIngestionService");

async function testSocialIngestion() {
  console.log("Testing WhatsApp & Telegram Job Ingestion Engine...");
  
  const sampleWhatsApp = {
    source: "WHATSAPP",
    groupName: "Ujjain & Bhopal Tech Opportunities 🇮🇳",
    senderName: "HR Techflow",
    messageText: "Hiring Urgent: Senior MERN Developer at TechFlow Solutions. Location: Remote / Bhopal. Salary: 15 LPA. Apply link: https://careers.techflow.io/mern-dev",
  };

  const parsed = SocialJobIngestionService.parseSocialJobPost(sampleWhatsApp);
  console.log("Parsed WhatsApp Job Post:", JSON.stringify(parsed, null, 2));

  const sampleTelegram = {
    source: "TELEGRAM",
    groupName: "AI & Fullstack Job Alerts Channel",
    senderName: "Telegram Bot",
    messageText: "Role: Fullstack AI Engineer. Company: Neural Cloud Labs. Location: Hybrid / Remote. Looking for candidates with Next.js, Python, LLM Prompting & Node.js skills. Apply at: hr@neuralcloud.ai",
  };

  const parsedTelegram = SocialJobIngestionService.parseSocialJobPost(sampleTelegram);
  console.log("Parsed Telegram Job Post:", JSON.stringify(parsedTelegram, null, 2));
}

testSocialIngestion();
