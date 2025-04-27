import { Redis } from '@upstash/redis';

// Initialize Redis with better error handling
let redis: Redis;

try {
  // Explicit configuration for Upstash Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("Initialized Redis with UPSTASH_REDIS credentials");
  }
  // Try Vercel KV credentials
  else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    console.log("Initialized Redis with KV_REST_API credentials");
  }
  // Fallback to environment variables
  else {
    redis = Redis.fromEnv();
    console.log("Initialized Redis from environment variables");
  }
  
  // Quick test to verify Redis connection
  (async () => {
    try {
      await redis.set("test-connection", "working");
      const testValue = await redis.get("test-connection");
      console.log(`Redis connection test: ${testValue}`);
    } catch (err) {
      console.error("Redis connection test failed:", err);
    }
  })();
  
} catch (error) {
  console.error("Failed to initialize Redis:", error);
  // Create a dummy Redis instance with basic methods
  redis = {
    set: async (key: string, value: any) => {
      console.warn(`[Mock Redis] SET ${key}`);
      return "OK";
    },
    get: async (key: string) => {
      console.warn(`[Mock Redis] GET ${key}`);
      return null;
    },
    del: async (key: string) => {
      console.warn(`[Mock Redis] DEL ${key}`);
      return 1;
    },
    scan: async (cursor: number, options: any) => {
      console.warn(`[Mock Redis] SCAN ${cursor}`);
      return { cursor: 0, keys: [] };
    },
    keys: async (pattern: string) => {
      console.warn(`[Mock Redis] KEYS ${pattern}`);
      return [];
    }
  } as unknown as Redis;
  console.warn("Using mock Redis instance due to initialization failure");
}

// Simple in-memory fallback for local development
const localCache = new Map<string, string>();

export { redis };

// Types
export interface Secret {
  secretId: string;
  email: string;
  createdAt: string;
}

export interface Vote {
  secretId: string;
  encryptedVote: string;
  timestamp: string;
}

// Basic key-value operations with fallback to local cache
// Save a key-value pair
export async function setKV(key: string, value: string) {
  try {
    // Try Redis first
    await redis.set(key, value);
    // Also save to local cache as backup
    localCache.set(key, value);
  } catch (error) {
    console.error(`Error in setKV for key ${key}:`, error);
    // Fallback to local cache
    localCache.set(key, value);
  }
}

// Get a value by key
export async function getKV<T = any>(key: string): Promise<T | null> {
  try {
    // Try Redis first
    const value = await redis.get(key);
    if (value !== null) return value as T;
    
    // Fallback to local cache
    const cachedValue = localCache.get(key);
    return cachedValue ? JSON.parse(cachedValue) : null;
  } catch (error) {
    console.error(`Error in getKV for key ${key}:`, error);
    // Fallback to local cache
    const cachedValue = localCache.get(key);
    return cachedValue ? JSON.parse(cachedValue) : null;
  }
}

// Delete a key
export async function deleteKV(key: string) {
  try {
    // Try Redis first
    await redis.del(key);
    // Also remove from local cache
    localCache.delete(key);
  } catch (error) {
    console.error(`Error in deleteKV for key ${key}:`, error);
    // At least remove from local cache
    localCache.delete(key);
  }
}

// Secret-specific functions
export async function getSecret(secretId: string): Promise<Secret | null> {
  try {
    const email = await getKV<string>(`secret:${secretId}`);
    if (!email) return null;
    
    return {
      secretId,
      email,
      createdAt: await getKV<string>(`secret:${secretId}:createdAt`) || new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error getting secret with ID ${secretId}:`, error);
    return null;
  }
}

export async function setSecret(secret: Secret): Promise<void> {
  try {
    await setKV(`secret:${secret.secretId}`, secret.email);
    await setKV(`email:${secret.email}`, secret.secretId);
    await setKV(`secret:${secret.secretId}:createdAt`, secret.createdAt);
  } catch (error) {
    console.error(`Error setting secret with ID ${secret.secretId}:`, error);
    throw error;
  }
}

export async function deleteSecret(secretId: string): Promise<void> {
  try {
    const secret = await getSecret(secretId);
    if (secret && secret.email) {
      await deleteKV(`email:${secret.email}`);
    }
    await deleteKV(`secret:${secretId}`);
    await deleteKV(`secret:${secretId}:createdAt`);
  } catch (error) {
    console.error(`Error deleting secret with ID ${secretId}:`, error);
    throw error;
  }
}

export async function getAllSecrets(): Promise<Secret[]> {
  try {
    // This is a simple implementation and may not scale well with large datasets
    const secrets: Secret[] = [];
    let cursor = 0;
    
    do {
      try {
        // For Upstash Redis, scan returns [nextCursor, keysArray]
        const result = await redis.scan(cursor, { match: "secret:*", count: 100 });
        
        // Update cursor - first element is the next cursor
        cursor = parseInt(result[0]);
        
        // Process keys - second element is the array of keys
        const keys = result[1];
        
        for (const key of keys) {
          // Only process the main secret keys (not metadata)
          if (key.includes(':createdAt')) continue;
          
          const secretId = key.replace('secret:', '');
          const secret = await getSecret(secretId);
          if (secret) {
            secrets.push(secret);
          }
        }
      } catch (error) {
        console.error("Error during scan in getAllSecrets:", error);
        break;
      }
    } while (cursor !== 0);
    
    return secrets;
  } catch (error) {
    console.error("Error in getAllSecrets:", error);
    return [];
  }
}

// Vote-specific functions
export async function addVote(vote: Vote): Promise<void> {
  try {
    await setKV(`vote:${vote.secretId}`, JSON.stringify(vote));
  } catch (error) {
    console.error(`Error adding vote with secret ID ${vote.secretId}:`, error);
    throw error;
  }
}

export async function getAllVotes(): Promise<Vote[]> {
  try {
    const votes: Vote[] = [];
    let cursor = 0;
    
    do {
      try {
        // For Upstash Redis, scan returns [nextCursor, keysArray]
        const result = await redis.scan(cursor, { match: "vote:*", count: 100 });
        
        // Update cursor - first element is the next cursor
        cursor = parseInt(result[0]);
        
        // Process keys - second element is the array of keys
        const keys = result[1];
        
        for (const key of keys) {
          const voteJson = await getKV<string>(key);
          if (voteJson) {
            try {
              const vote = JSON.parse(voteJson) as Vote;
              votes.push(vote);
            } catch (parseError) {
              console.error(`Error parsing vote from key ${key}:`, parseError);
            }
          }
        }
      } catch (error) {
        console.error("Error during scan in getAllVotes:", error);
        break;
      }
    } while (cursor !== 0);
    
    return votes;
  } catch (error) {
    console.error("Error in getAllVotes:", error);
    return [];
  }
}

export async function getVoteCount(): Promise<number> {
  try {
    const votes = await getAllVotes();
    return votes.length;
  } catch (error) {
    console.error("Error in getVoteCount:", error);
    return 0;
  }
}
