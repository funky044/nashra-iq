// Mock Redis for static/serverless deployments
const mockRedisEnabled = !process.env.REDIS_URL;

export async function getRedisClient() {
  if (mockRedisEnabled) {
    return null; // No Redis in static mode
  }
  // Real Redis code would go here
  return null;
}

export async function cacheGet(key: string) {
  return null; // No cache in static mode
}

export async function cacheSet(key: string, value: string, expirySeconds?: number) {
  return null; // No cache in static mode
}

export async function cacheDel(key: string) {
  return null; // No cache in static mode
}

export default null;
