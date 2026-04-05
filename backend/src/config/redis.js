import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://default:v8wNK7Qzt6Kg35m5MNXdMQKGGuxUy68W@redis-12398.crce276.ap-south-1-3.ec2.cloud.redislabs.com:12398",
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
