// Edge-compatible Redis client using API endpoints
// This works in Edge runtime by making internal API calls

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Extract Redis connection details from URL
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 6379,
    password: parsed.password || undefined,
  };
}

// Edge-compatible Redis client using internal API calls
class EdgeRedisClient {
  private baseUrl: string;

  constructor() {
    // In development, use localhost, in production use the actual domain
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!key || typeof key !== 'string') {
        console.error('Edge Redis get: Invalid key');
        return null;
      }

      const response = await fetch(`${this.baseUrl}/api/redis/get`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'EdgeRedisClient/1.0'
        },
        body: JSON.stringify({ key }),
        // Add timeout for Edge runtime
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error(`Edge Redis get error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      return data.value || null;
    } catch (error) {
      console.error('Edge Redis get error:', error);
      return null;
    }
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    try {
      if (!key || !seconds || !value) {
        console.error('Edge Redis setex: Invalid parameters');
        return "ERROR";
      }

      const response = await fetch(`${this.baseUrl}/api/redis/setex`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'EdgeRedisClient/1.0'
        },
        body: JSON.stringify({ key, seconds, value }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error(`Edge Redis setex error: ${response.status} ${response.statusText}`);
        return "ERROR";
      }

      const data = await response.json();
      return data.result || "OK";
    } catch (error) {
      console.error('Edge Redis setex error:', error);
      return "ERROR";
    }
  }

  async del(key: string): Promise<number> {
    try {
      if (!key || typeof key !== 'string') {
        console.error('Edge Redis del: Invalid key');
        return 0;
      }

      const response = await fetch(`${this.baseUrl}/api/redis/del`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'EdgeRedisClient/1.0'
        },
        body: JSON.stringify({ key }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error(`Edge Redis del error: ${response.status} ${response.statusText}`);
        return 0;
      }

      const data = await response.json();
      return data.result || 0;
    } catch (error) {
      console.error('Edge Redis del error:', error);
      return 0;
    }
  }

  // Add ping method for health checks
  async ping(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/redis/ping`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'EdgeRedisClient/1.0'
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) return "ERROR";
      
      const data = await response.json();
      return data.result || "PONG";
    } catch (error) {
      console.error('Edge Redis ping error:', error);
      return "ERROR";
    }
  }
}

export const edgeRedis = new EdgeRedisClient();