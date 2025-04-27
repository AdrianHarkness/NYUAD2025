import { getKV, setKV, deleteKV } from "@/lib/kv-storage";

// Save a vote
export async function addVote({ secretId, encryptedVote, timestamp }: { secretId: string, encryptedVote: string, timestamp: string }) {
  try {
    await setKV(`vote:${secretId}`, JSON.stringify({ secretId, encryptedVote, timestamp }));
  } catch (error) {
    console.error(`Error saving vote for secret ID ${secretId}:`, error);
    throw error;
  }
}

// Validate a secret
export async function isSecretValid(secretId: string) {
  try {
    console.log(`Checking if secret ID is valid: ${secretId}`);
    const email = await getKV<string>(`secret:${secretId}`);
    console.log(`Email for secret ID ${secretId}: ${email}`);
    return !!email;
  } catch (error) {
    console.error(`Error validating secret with ID ${secretId}:`, error);
    return false;
  }
}

// Remove a secret
export async function removeSecret(secretId: string) {
  try {
    await deleteKV(`secret:${secretId}`);
  } catch (error) {
    console.error(`Error removing secret with ID ${secretId}:`, error);
    throw error;
  }
}

// Find secret ID by email
export async function findSecretIdByEmail(email: string) {
  try {
    return await getKV<string>(`email:${email}`);
  } catch (error) {
    console.error(`Error finding secret ID for email ${email}:`, error);
    return null;
  }
}

// Save a new secret
export async function addSecret(secretId: string, email: string) {
  try {
    await setKV(`email:${email}`, secretId);
    await setKV(`secret:${secretId}`, email);
  } catch (error) {
    console.error(`Error adding secret for email ${email}:`, error);
    throw error;
  }
}

// Get all votes 
export async function getAllVotes() {
  try {
    // First try direct keys method for Upstash Redis
    const voteKeys = await getVoteKeys();
    const votes = [];
    
    // Get values for each key
    for (const key of voteKeys) {
      try {
        const voteData = await getKV(key);
        if (voteData) {
          // Parse the JSON data if it's stored as a string
          if (typeof voteData === 'string') {
            votes.push(JSON.parse(voteData));
          } else {
            votes.push(voteData);
          }
        }
      } catch (error) {
        console.error(`Error getting vote for key ${key}:`, error);
      }
    }
    
    return votes;
  } catch (error) {
    console.error('Error getting all votes:', error);
    return [];
  }
}

// Helper function to get all vote keys
async function getVoteKeys() {
  try {
    // Try direct 'keys' method for Upstash Redis 
    // (This is available in Upstash Redis but not in all Redis implementations)
    const redis = await import('@/lib/kv-storage').then(m => m.redis);
    return await redis.keys('vote:*');
  } catch (error) {
    console.error('Error getting vote keys, falling back to prefix scan:', error);
    return fallbackGetVoteKeys();
  }
}

// Fallback method to get vote keys using scan
async function fallbackGetVoteKeys() {
  const keys = [];
  let cursor = 0;
  const redis = await import('@/lib/kv-storage').then(m => m.redis);
  
  do {
    try {
      // For Upstash Redis, scan returns [nextCursor, keysArray]
      const result = await redis.scan(cursor, { match: 'vote:*', count: 100 });
      
      // Update cursor - first element is the next cursor
      cursor = parseInt(result[0]);
      
      // Add keys - second element is the array of keys
      keys.push(...result[1]);
    } catch (error) {
      console.error('Error in scan operation:', error);
      break; // Exit the loop on error
    }
  } while (cursor !== 0);
  
  return keys;
}
