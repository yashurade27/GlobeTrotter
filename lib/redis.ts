import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL!);

redis.ping().then((res) => {
  console.log("✅ Redis connected:", res); // should log "PONG"
}).catch(err => {
  console.error("❌ Redis connection error:", err);
});