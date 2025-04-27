import { promises as fs } from "fs"
import path from "path"

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

// Base directory for data files
const DATA_DIR = path.join(process.cwd(), "data")

// Ensure the data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    return true
  } catch (error) {
    console.error("Error creating data directory:", error)
    return false
  }
}

// File paths
const SECRETS_FILE = path.join(DATA_DIR, "secrets.json")
const VOTES_FILE = path.join(DATA_DIR, "votes.json")

// Helper functions
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(filePath, "utf8")
    return JSON.parse(data) as T
  } catch (error) {
    // If file doesn't exist or can't be read, return default value
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      try {
        await fs.writeFile(filePath, JSON.stringify(defaultValue), "utf8")
      } catch (writeError) {
        console.error("Error writing default value to file:", writeError)
      }
    }
    return defaultValue
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<boolean> {
  try {
    await ensureDataDir()
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error writing to file:", error)
    return false
  }
}

// Secret functions
export async function getSecret(secretId: string): Promise<Secret | null> {
  const secrets = await getAllSecrets()
  return secrets.find((s) => s.secretId === secretId) || null
}

export async function setSecret(secret: Secret): Promise<void> {
  const secrets = await getAllSecrets()
  const index = secrets.findIndex((s) => s.secretId === secret.secretId)

  if (index >= 0) {
    secrets[index] = secret
  } else {
    secrets.push(secret)
  }

  await writeJsonFile(SECRETS_FILE, secrets)
}

export async function deleteSecret(secretId: string): Promise<void> {
  const secrets = await getAllSecrets()
  const filteredSecrets = secrets.filter((s) => s.secretId !== secretId)
  await writeJsonFile(SECRETS_FILE, filteredSecrets)
}

export async function getAllSecrets(): Promise<Secret[]> {
  return await readJsonFile<Secret[]>(SECRETS_FILE, [])
}

// Vote functions
export async function addVote(vote: Vote): Promise<void> {
  const votes = await getAllVotes()
  votes.push(vote)
  await writeJsonFile(VOTES_FILE, votes)
}

export async function getAllVotes(): Promise<Vote[]> {
  return await readJsonFile<Vote[]>(VOTES_FILE, [])
}

export async function getVoteCount(): Promise<number> {
  const votes = await getAllVotes()
  return votes.length
}
