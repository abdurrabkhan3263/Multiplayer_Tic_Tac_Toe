import { createClient } from "redis";

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  password: process.env.REDIS_PASSWORD || "",
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

(async () => {
  await redis.connect();
  console.log("Connected to Redis");
})();

export default redis;
