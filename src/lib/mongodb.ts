import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "trillionaire-fit",
    });
    isConnected = true;
    console.log("✅ Successfully connected to MongoDB Atlas via Mongoose");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB", err);
    throw err;
  }
}
