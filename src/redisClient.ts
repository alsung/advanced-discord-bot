// src/redisClient.ts
import Redis from "ioredis";
import type { Redis as RedisClientType } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Use 'unknown' type assertion and cast to RedisClientType
const redis = new (Redis as unknown as { new (...args: any[]): RedisClientType })(process.env.REDIS_URL!, {
    tls: process.env.REDIS_URL?.includes("rediss://") ? {} : undefined, // Enable TLS if using rediss://
});

redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err: Error) => console.error("Redis connection error:", err));

export default redis;
