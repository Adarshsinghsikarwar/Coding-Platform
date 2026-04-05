import { createClient } from "redis";

export const redisClient = createClient({
  url: "",
});

redisClient.on("error", (err) => console.log("Redis Error:", err));

export async function connectRedis() {
  await redisClient.connect();
  console.log("Connected to Redis Cloud");

  // // test
  // await redisClient.set("test", "hello");
  // const value = await redisClient.get("test");

  // console.log(value); // hello
}
