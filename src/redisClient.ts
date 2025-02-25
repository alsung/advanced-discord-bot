import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
});

redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err: Error) => console.error("Redis connection error:", err));

export default redis;