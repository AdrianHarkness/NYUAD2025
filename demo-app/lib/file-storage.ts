import path from "path"
import { promises as fsPromises } from "fs"

// Base directory for data files
const DATA_DIR = path.join(process.cwd(), "data")

// Ensure the data directory exists
export async function ensureDataDir() {
  try {
    await fsPromises.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error("Error creating data directory:", error)
  }
}

// Get the path to a data file
export function getDataFilePath(filename: string): string {
  return path.join(DATA_DIR, filename)
}

// Read data from a JSON file
export async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  const filePath = getDataFilePath(filename)

  try {
    // Check if file exists
    await fsPromises.access(filePath)

    // Read and parse the file
    const data = await fsPromises.readFile(filePath, "utf8")
    return JSON.parse(data) as T
  } catch (error) {
    // If file doesn't exist or can't be read, return default value
    console.log(`File ${filename} not found or error reading, using default value`)

    // Create the file with default value
    await writeJsonFile(filename, defaultValue)

    return defaultValue
  }
}

// Write data to a JSON file
export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = getDataFilePath(filename)

  try {
    // Ensure data directory exists
    await ensureDataDir()

    // Write the data to the file
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8")
  } catch (error) {
    console.error(`Error writing to file ${filename}:`, error)
    throw error
  }
}

// Append data to a JSON array file
export async function appendToJsonArrayFile<T>(filename: string, item: T): Promise<void> {
  const filePath = getDataFilePath(filename)

  try {
    // Ensure data directory exists
    await ensureDataDir()

    // Read existing data or create empty array
    let data: T[] = []

    try {
      await fsPromises.access(filePath)
      const fileContent = await fsPromises.readFile(filePath, "utf8")
      data = JSON.parse(fileContent) as T[]
    } catch (error) {
      // File doesn't exist or can't be read, use empty array
      data = []
    }

    // Append the new item
    data.push(item)

    // Write back to the file
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8")
  } catch (error) {
    console.error(`Error appending to file ${filename}:`, error)
    throw error
  }
}

// Get all data from a JSON array file
export async function getAllFromJsonFile<T>(filename: string): Promise<T[]> {
  return await readJsonFile<T[]>(filename, [])
}

// Check if an item exists in a JSON array file based on a key
export async function existsInJsonFile<T>(filename: string, key: keyof T, value: any): Promise<boolean> {
  const data = await getAllFromJsonFile<T>(filename)
  return data.some((item) => item[key] === value)
}

// Remove an item from a JSON array file based on a key
export async function removeFromJsonFile<T>(filename: string, key: keyof T, value: any): Promise<boolean> {
  const filePath = getDataFilePath(filename)

  try {
    // Read existing data
    const data = await getAllFromJsonFile<T>(filename)

    // Find the index of the item to remove
    const index = data.findIndex((item) => item[key] === value)

    if (index === -1) {
      return false // Item not found
    }

    // Remove the item
    data.splice(index, 1)

    // Write back to the file
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8")

    return true
  } catch (error) {
    console.error(`Error removing from file ${filename}:`, error)
    throw error
  }
}
