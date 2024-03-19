import { RedisClientType, createClient } from "redis";

export async function setupRedis() {
  const redisClient: RedisClientType = createClient({
    url: process.env.REDISCS,
  });

  redisClient.on("error", (error) => console.error(error));
  await redisClient.connect();
  console.log("Redis client connected");
  return redisClient;
}
