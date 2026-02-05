import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import Redis from "ioredis";

export default fp(async (app) => {
  const redis = new Redis(process.env.REDIS_URL || "");
  app.register(rateLimit, {
    max: 2,
    timeWindow: "1 second",
    redis
  });
});
