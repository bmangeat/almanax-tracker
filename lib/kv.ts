import { Redis } from "@upstash/redis";

// Nom des variables injectées par l'intégration marketplace Upstash for Redis
// sur Vercel. À ajuster si le préfixe diffère une fois l'intégration connectée
// (vérifier avec `vercel env ls`).
export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export type PushSubscriptionRecord = {
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
  favoris: string[]; // dates "MM-DD"
};

const SET_KEY = "push:endpoints";

function keyFor(endpoint: string) {
  return `push:sub:${endpoint}`;
}

export async function saveSubscription(record: PushSubscriptionRecord) {
  const endpoint = record.subscription.endpoint;
  await redis.set(keyFor(endpoint), record);
  await redis.sadd(SET_KEY, endpoint);
}

export async function removeSubscription(endpoint: string) {
  await redis.del(keyFor(endpoint));
  await redis.srem(SET_KEY, endpoint);
}

export async function listSubscriptions(): Promise<PushSubscriptionRecord[]> {
  const endpoints = await redis.smembers(SET_KEY);
  if (endpoints.length === 0) return [];
  const records = await Promise.all(
    endpoints.map((e) => redis.get<PushSubscriptionRecord>(keyFor(e)))
  );
  return records.filter((r): r is PushSubscriptionRecord => r !== null);
}
