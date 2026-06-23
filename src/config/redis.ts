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

export default redisClient;
