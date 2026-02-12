import { createClient } from "redis";

export const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.error("Redis Client Error", err));

// Connect the client
export const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
};

// Helper function to invalidate member cache for a gym
export const invalidateMemberCache = async (gymId: string) => {
  try {
    const pattern = `gymId:${gymId}:members:*`;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`Invalidated ${keys.length} cache entries for gym ${gymId}`);
    }
  } catch (error) {
    console.error("Error invalidating cache:", error);
  }
};
