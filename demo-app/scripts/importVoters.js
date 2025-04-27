const mongoose = require("mongoose")
const fs = require("fs")
const xlsx = require("xlsx")
const crypto = require("crypto")
const path = require("path")

// Import your Voter model
const Voter = require("../models/voter")

// Encryption key setup (you must save this key somewhere safe)
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || "12345678901234567890123456789012", "utf-8") // 32 bytes key for AES-256
const IV_LENGTH = 16 // AES block size

function encrypt(text) {
  if (!text) text = ""
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text.toString(), "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/eVotingDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.connection.once("open", () => {
  console.log("✅ Connected to MongoDB")
  importVotersIfEmpty()
})

async function importVotersIfEmpty() {
  try {
    const voterCount = await Voter.countDocuments()
    if (voterCount === 0) {
      console.log("📄 No voters found, importing from XLSX...")

      const filePath = path.join(__dirname, "input.xlsx")
      if (!fs.existsSync(filePath)) {
        console.error("❌ Excel file not found:", filePath)
        mongoose.connection.close()
        return
      }

      const workbook = xlsx.readFile(filePath)
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const data = xlsx.utils.sheet_to_json(sheet)

      if (!Array.isArray(data) || data.length === 0) {
        console.error("❌ Excel file is empty or invalid.")
        mongoose.connection.close()
        return
      }

      const votersToInsert = data.map((entry) => ({
        name: encrypt(entry.Name || ""),
        Type: encrypt(entry.Type || ""),
        email: encrypt(entry.Email || ""),
        secretId: encrypt(crypto.randomBytes(32).toString("hex")), // Encrypt the secret ID too!
      }))

      await Voter.insertMany(votersToInsert)
      console.log("🎉 Voters imported and encrypted successfully!")
      mongoose.connection.close()
    } else {
      console.log("✅ Voters already exist. Skipping import.")
      mongoose.connection.close()
    }
  } catch (error) {
    console.error("❌ Error importing voters:", error)
    mongoose.connection.close()
  }
}
