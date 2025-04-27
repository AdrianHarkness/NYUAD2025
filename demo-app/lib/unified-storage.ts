import * as kvStorage from "./kv-storage"
import * as fallbackStorage from "./fallback-storage"

// Types
export interface Secret {
  secretId: string
  email: string
  createdAt: string
}

export interface Vote {
  secretId: string
  encryptedVote: string
  timestamp: string
}

// Determine if we should use KV or fallback
// Check for Vercel environment indicator OR Upstash/Vercel KV credentials
const useKV = 
  typeof process !== 'undefined' && (
    process.env.VERCEL === "1" || 
    !!process.env.UPSTASH_REDIS_REST_URL || 
    !!process.env.KV_REST_API_URL ||
    !!process.env.REDIS_URL
  )

// Log which storage is being used (helpful for debugging)
console.log(`Using ${useKV ? 'KV' : 'fallback'} storage system`)

// Secret functions
export async function getSecret(secretId: string): Promise<Secret | null> {
  try {
    if (useKV) {
      return await kvStorage.getSecret(secretId)
    } else {
      return await fallbackStorage.getSecret(secretId)
    }
  } catch (error) {
    console.error("Error in getSecret:", error)
    return null
  }
}

export async function setSecret(secret: Secret): Promise<void> {
  try {
    if (useKV) {
      await kvStorage.setSecret(secret)
    } else {
      await fallbackStorage.setSecret(secret)
    }
  } catch (error) {
    console.error("Error in setSecret:", error)
  }
}

export async function deleteSecret(secretId: string): Promise<void> {
  try {
    if (useKV) {
      await kvStorage.deleteSecret(secretId)
    } else {
      await fallbackStorage.deleteSecret(secretId)
    }
  } catch (error) {
    console.error("Error in deleteSecret:", error)
  }
}

export async function getAllSecrets(): Promise<Secret[]> {
  try {
    if (useKV) {
      return await kvStorage.getAllSecrets()
    } else {
      return await fallbackStorage.getAllSecrets()
    }
  } catch (error) {
    console.error("Error in getAllSecrets:", error)
    return []
  }
}

// Vote functions
export async function addVote(vote: Vote): Promise<void> {
  try {
    if (useKV) {
      await kvStorage.addVote(vote)
    } else {
      await fallbackStorage.addVote(vote)
    }
  } catch (error) {
    console.error("Error in addVote:", error)
    throw error
  }
}

export async function getAllVotes(): Promise<Vote[]> {
  try {
    if (useKV) {
      return await kvStorage.getAllVotes()
    } else {
      return await fallbackStorage.getAllVotes()
    }
  } catch (error) {
    console.error("Error in getAllVotes:", error)
    return []
  }
}

export async function getVoteCount(): Promise<number> {
  try {
    if (useKV) {
      return await kvStorage.getVoteCount()
    } else {
      return await fallbackStorage.getVoteCount()
    }
  } catch (error) {
    console.error("Error in getVoteCount:", error)
    return 0
  }
}
