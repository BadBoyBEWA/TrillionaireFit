import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI or MONGODB_ATLAS_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log(`🔌 Connecting to MongoDB via Mongoose...`);

    cached.promise = mongoose.connect(MONGODB_URI!).then((mongooseConnection) => {
      console.log(`✅ Successfully connected to MongoDB via Mongoose`);
      return mongooseConnection;
    }) as any;
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Mongoose connection failed:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
