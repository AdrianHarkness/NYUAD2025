import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/eVotingDB"
const MONGODB_DB = process.env.MONGODB_DB || "eVotingDB"

// Check if the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// Check if the MongoDB DB is defined
if (!MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable")
}

let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Create a new MongoDB client
  const client = new MongoClient(MONGODB_URI)

  // Connect to the client
  await client.connect()

  // Get the database
  const db = client.db(MONGODB_DB)

  // Cache the client and db connection
  cachedClient = client
  cachedDb = db

  return { client, db }
}
