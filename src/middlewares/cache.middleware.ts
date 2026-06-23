import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis.js";

export const cache = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log("Serving from cache");
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json.bind(res);

      res.json = ((body: any) => {
        redisClient.setEx(key, duration, JSON.stringify(body));
        return originalJson(body);
      }) as typeof res.json;

      next();
    } catch (error) {
      console.error("cache error:", error);
      next();
    }
  };
};
