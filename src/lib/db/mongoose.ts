import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://localhost:27017/applypilot_dev";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-allow-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isCloud = MONGODB_URI.includes("mongodb+srv://") || MONGODB_URI.includes("mongodb.net");
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: isCloud ? 5000 : 1000, // 5s timeout for Atlas Cloud, 1s for Local
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log(`[MongoDB Connection] Connected to Atlas Cloud Database cleanly.`);
        return m;
      })
      .catch((err) => {
        console.warn("MongoDB connection offline/failed. Switching to In-Memory Dev Engine:", err?.message || err);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch {
    cached.promise = null;
    return null;
  }
}
