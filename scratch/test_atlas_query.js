const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://bantikevat199_db_user:Kevat%40tech7@cluster0.bg4qutk.mongodb.net/applypilot?retryWrites=true&w=majority&appName=Cluster0";

async function testQuery() {
  await mongoose.connect(MONGODB_URI);
  const CanonicalJob = mongoose.model("CanonicalJob", new mongoose.Schema({}, { strict: false }), "canonicaljobs");

  const filter = {
    $or: [
      { sourceCategory: { $regex: "WhatsApp|Telegram", $options: "i" } },
      { source: { $regex: "WhatsApp|Telegram", $options: "i" } },
      { sourceAdapter: { $regex: "WhatsApp|Telegram", $options: "i" } },
    ]
  };

  const count = await CanonicalJob.countDocuments(filter);
  const jobs = await CanonicalJob.find(filter);
  console.log("MongoDB Atlas Count:", count);
  console.log("MongoDB Atlas Jobs:", jobs.map(j => j.title));
  await mongoose.disconnect();
}

testQuery();
