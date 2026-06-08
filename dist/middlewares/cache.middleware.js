import redisClient from "../config/redis.js";
export const cache = (duration) => {
    return async (req, res, next) => {
        const key = `cache:${req.originalUrl}`;
        try {
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                console.log("Serving from cache");
                return res.json(JSON.parse(cachedData));
            }
            const originalJson = res.json.bind(res);
            res.json = ((body) => {
                redisClient.setEx(key, duration, JSON.stringify(body));
                return originalJson(body);
            });
            next();
        }
        catch (error) {
            console.error("cache error:", error);
            next();
        }
    };
};
