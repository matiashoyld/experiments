import { Redis } from '@upstash/redis';

// Falls back gracefully — if env vars aren't set, redis will be null
// and the app continues with localStorage only
let redis: Redis | null = null;

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export { redis };
