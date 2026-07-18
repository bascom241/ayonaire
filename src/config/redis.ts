import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err: Error) => {
  console.error("Redis Error:", err);
});

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
  console.log("Redis connected");
};

// Cache invalidation must never be able to fail a real write operation - a
// bare `await redisClient.del(...)` inside a controller's try/catch was
// turning "course created successfully" into a 500 whenever Redis was
// unreachable (which, since connectRedis() is never awaited at startup, is
// effectively always, until the client establishes its first connection).
export const safeCacheDel = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Redis cache invalidation failed for "${key}":`, error);
  }
};

export default redisClient;
