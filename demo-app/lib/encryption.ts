import crypto from "crypto"

// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012" // 32 characters
const IV = Buffer.alloc(16, 0) // 16 bytes all zeros IV

/**
 * Encrypt text using AES-256-CBC
 * @param text Text to encrypt
 * @returns Encrypted text as hex string
 */
export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), IV)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return encrypted
}

/**
 * Decrypt hex string using AES-256-CBC
 * @param text Encrypted hex string to decrypt
 * @returns Decrypted text
 */
export function decrypt(text: string): string {
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), IV)
  let decrypted = decipher.update(text, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
