// src/redisClient.ts
import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

console.log("Starting Redis client...");

const redis = new Redis(process.env.REDIS_URL!);

redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err: Error) => console.error("Redis connection error:", err));

export default redis;
