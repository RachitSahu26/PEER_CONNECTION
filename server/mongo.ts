import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  await mongoose.connect(uri, {
    maxPoolSize: 5,                 // 👈 reduce pressure
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });

  // 👇 WAIT for stable ready state
  await new Promise<void>((resolve) => {
    if (mongoose.connection.readyState === 1) return resolve();
    mongoose.connection.once("connected", () => resolve());
  });

  isConnected = true;
  console.log("MongoDB connected");
}

export function getMongoClient() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB not ready");
  }
  return mongoose.connection.getClient();
}
