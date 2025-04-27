const express = require("express")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

console.log("✅ All modules loaded")

const app = express()
const port = process.env.PORT || 3000

// --- MIDDLEWARE ---
console.log("⌛ Setting up Express middleware...")
app.use(cors())
app.use(express.json())
// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")))
console.log("✅ Express middleware setup complete")

// --- CONFIG ---
const frontendBaseURL = process.env.FRONTEND_URL || "https://sawty-voting.vercel.app"
const encryptionKey = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012" // 32 characters
const iv = Buffer.alloc(16, 0) // 16 bytes all zeros IV

const mailingList = process.env.MAILING_LIST
  ? process.env.MAILING_LIST.split(",")
  : [
   "mariamshafey3@gmail.com"
  ]

const issuedSecrets = {} // { secretId: email }
let votes = [] // fallback if MongoDB fails

const votesFile = path.join(__dirname, "votes.json")
if (fs.existsSync(votesFile)) {
  try {
    votes = JSON.parse(fs.readFileSync(votesFile))
  } catch (err) {
    console.error("❌ Error reading votes file:", err)
    // Create an empty votes file if it doesn't exist or is corrupted
    fs.writeFileSync(votesFile, JSON.stringify([]))
  }
}

// --- DB CONNECTION ---
// --- Email Transporter ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "mariamshafey3@gmail.com",
    pass: process.env.EMAIL_PASS || "siffmirrcuqtvaeg", // app password
  },
})

// --- ENCRYPTION FUNCTIONS ---
function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(encryptionKey), iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return encrypted
}

function decrypt(text) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(encryptionKey), iv)
  let decrypted = decipher.update(text, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

// --- HELPER ---
function findSecretIdByEmail(email) {
  for (const [secretId, mappedEmail] of Object.entries(issuedSecrets)) {
    if (mappedEmail === email) {
      return secretId
    }
  }
  return null
}

// --- ROUTES ---

// ✅ Generate and Email Secret Links for All
app.post("/api/generate-for-all", async (req, res) => {
  const results = []

  for (const email of mailingList) {
    let secretId = findSecretIdByEmail(email)

    if (!secretId) {
      secretId = crypto.randomBytes(4).toString("hex")
      issuedSecrets[secretId] = email
    }

    const encryptedSecretId = encrypt(secretId)
    const loginLink = `${frontendBaseURL}/index?token=${encodeURIComponent(encryptedSecretId)}`

    const mailOptions = {
      from: `"Sawty Voting" <${process.env.EMAIL_USER || "mariamshafey3@gmail.com"}>`,
      to: email,
      subject: "Your Sawty Voting Link",
      text: `Hello,


Your Private ID is ${secretId}.

Please click the link below to log in automatically and cast your secure vote:

${loginLink}

This link is encrypted for your privacy.
Please do not share it with anyone.

Thank you,
Sawty Team
`,
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log(`✅ Secure Voting Link sent to ${email}`)
      results.push({ email, secretId, status: "success" })
    } catch (error) {
      console.error(`❌ Failed to send to ${email}`, error)
      results.push({ email, status: "failed", error: error.message })
    }
  }

  res.json({ message: "Done sending secure links to mailing list", results })
})

// ✅ Generate Secret for One Person
app.post("/api/generate-secret", async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: "Email is required." })

  let secretId = findSecretIdByEmail(email)

  if (!secretId) {
    secretId = crypto.randomBytes(4).toString("hex")
    issuedSecrets[secretId] = email
  }

  const encryptedSecretId = encrypt(secretId)
  const loginLink = `${frontendBaseURL}/index?token=${encodeURIComponent(encryptedSecretId)}`

  const mailOptions = {
    from: `"Sawty Voting" <${process.env.EMAIL_USER || "mariamshafey3@gmail.com"}>`,
    to: email,
    subject: "Your Sawty Voting Link",
    text: `Hello,


Your Private ID is ${secretId}.

Please click the link below to log in automatically and cast your secure vote:

${loginLink}

This link is encrypted for your privacy.
Please do not share it with anyone.

Thank you,
Sawty Team
`,
  }
  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Secure Voting Link sent to ${email}`)
    res.json({ message: "Secure link generated and emailed!" })
  } catch (error) {
    console.error("Error sending email:", error)
    res.status(500).json({ message: "Failed to send email.", error: error.message })
  }
})

// ✅ Submit Vote
app.post("/api/submit-vote", async (req, res) => {
  const { secretId, encryptedVote } = req.body
  if (!secretId || !encryptedVote) {
    return res.status(400).json({ message: "Private ID and vote are required." })
  }

  if (!issuedSecrets[secretId]) {
    return res.status(400).json({ message: "Invalid or expired Private ID." })
  }

  try {
    // Also save to local file as backup
    votes.push({ secretId, encryptedVote, timestamp: new Date().toISOString() })
    fs.writeFileSync(votesFile, JSON.stringify(votes, null, 2))

    delete issuedSecrets[secretId]

    console.log(`✅ Vote recorded in DB for Secret ID ${secretId}`)
    res.json({ message: "Vote submitted securely!" })
  } catch (err) {
    console.error("❌ Error saving vote to MongoDB:", err)
    // fallback save
    votes.push({ secretId, encryptedVote, timestamp: new Date().toISOString() })
    console.log({ secretId, encryptedVote, timestamp: new Date().toISOString() })
    fs.writeFileSync(votesFile, JSON.stringify(votes, null, 2))
    res.status(500).json({ message: "Saved locally due to DB error." })
  }
})

// ✅ Verify Secret
app.post("/api/verify-secret", (req, res) => {
  const { secretId } = req.body
  if (!secretId) return res.status(400).json({ valid: false, message: "Secret ID required." })

  if (issuedSecrets[secretId]) {
    return res.json({ valid: true, message: "Valid Secret ID." })
  } else {
    return res.status(400).json({ valid: false, message: "Invalid or expired Secret ID." })
  }
})

// ✅ Admin View Votes
app.get("/api/admin/votes", async (req, res) => {
  res.json(votes)
})

// ✅ Admin votes.json for Blockchain Frontend
app.get("/api/admin/votes.json", (req, res) => {
  res.sendFile(votesFile)
})

// ✅ Get Voters
app.get("/api/voters", async (req, res) => {
  try {
    const voters = await Voter.find()

    const decryptedVoters = voters.map((voter) => ({
      name: decrypt(voter.name),
      Type: decrypt(voter.Type),
      email: decrypt(voter.email),
      secretId: decrypt(voter.secretId),
    }))

    res.json(decryptedVoters)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ✅ Get Voter by Secret ID
app.get("/api/voters/:secretId", async (req, res) => {
  const requestedSecretId = req.params.secretId

  try {
    const voters = await Voter.find() // get all voters (encrypted)

    // Decrypt secretId and find the matching voter
    const matchingVoter = voters.find((voter) => {
      const decryptedSecretId = decrypt(voter.secretId)
      return decryptedSecretId === requestedSecretIdG
    })

    if (!matchingVoter) {
      return res.status(404).json({ message: "Voter not found" })
    }

    // Decrypt full voter info
    const decryptedVoter = {
      name: decrypt(matchingVoter.name),
      Type: decrypt(matchingVoter.Type),
      email: decrypt(matchingVoter.email),
      secretId: decrypt(matchingVoter.secretId),
    }

    res.json(decryptedVoter)
  } catch (err) {
    console.error("Error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a mapping (admin function)
app.delete("/api/admin/mappings/:secretId", (req, res) => {
  const { secretId } = req.params

  if (issuedSecrets[secretId]) {
    delete issuedSecrets[secretId]
    saveSecrets() // Save to file
    res.json({ success: true, message: "Mapping deleted successfully" })
  } else {
    res.status(404).json({ success: false, message: "Mapping not found" })
  }
})

// ✅ Debug
app.get("/__debug", (req, res) => {
  res.send("✅ This is the REAL Sawty server running.")
})

// --- Start server first, then load data ---
console.log("🚀 Attempting to start server...")
app.listen(port, () => {
  // console.log(`🗳️ Sawty backend running at http://localhost:${port}`)

  console.log("📂 Loading votes file...")
  // Load votes file asynchronously after server starts
  fs.promises
    .readFile(votesFile)
    .then((data) => {
      try {
        votes = JSON.parse(data)
        console.log("✅ Votes data loaded")
      } catch (err) {
        console.error("❌ Error parsing votes file:", err)
        votes = []
        fs.writeFileSync(votesFile, JSON.stringify([]))
      }
    })
    .catch((err) => {
      if (err.code !== "ENOENT") {
        console.error("❌ Error loading votes file:", err)
      } else {
        console.log("ℹ️ No existing votes file found - starting fresh")
        // Create an empty votes file
        fs.writeFileSync(votesFile, JSON.stringify([]))
      }
    })
})

function saveSecrets() {
  // Implement the logic to save issuedSecrets to a file or database
  // This is a placeholder, replace with your actual implementation
  console.log("Saving secrets to file (placeholder)")
  fs.writeFileSync("secrets.json", JSON.stringify(issuedSecrets, null, 2))
}
