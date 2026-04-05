import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Error:", err));

export async function connectRedis() {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined in environment variables");
  }

  await redisClient.connect();
  console.log("Connected to Redis Cloud");

  // // test
  // await redisClient.set("test", "hello");
  // const value = await redisClient.get("test");

  // console.log(value); // hello
}
