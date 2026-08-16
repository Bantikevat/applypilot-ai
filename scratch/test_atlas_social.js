const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://bantikevat199_db_user:Kevat%40tech7@cluster0.bg4qutk.mongodb.net/applypilot?retryWrites=true&w=majority&appName=Cluster0";

async function testAtlasSocial() {
  await mongoose.connect(MONGODB_URI);
  const CanonicalJob = mongoose.model("CanonicalJob", new mongoose.Schema({}, { strict: false }), "canonicaljobs");

  const jobs = await CanonicalJob.find({
    $or: [
      { sourceCategory: { $regex: "WhatsApp|Telegram", $options: "i" } },
      { source: { $regex: "WhatsApp|Telegram", $options: "i" } },
      { sourceAdapter: { $regex: "WhatsApp|Telegram", $options: "i" } },
    ]
  });

  console.log("Atlas Social Jobs Found:", jobs.length);
  for (const j of jobs) {
    console.log(`- [${j.sourceCategory}] ${j.title} at ${j.company} (${j.source})`);
  }

  await mongoose.disconnect();
}

testAtlasSocial();
