import { NextResponse } from "next/server"
import crypto from "crypto"
import nodemailer from "nodemailer"
import { findSecretIdByEmail, addSecret } from "@/lib/store"
import { encrypt } from "@/lib/encryption"

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "mariamshafey3@gmail.com",
    pass: process.env.EMAIL_PASS || "siffmirrcuqtvaeg", // app password
  },
})

// Frontend URL
const frontendBaseURL = process.env.FRONTEND_URL || "https://sawty-voting.vercel.app"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 })
    }

    // Check if a secret already exists for this email
    let secretId = await findSecretIdByEmail(email)

    // If not, generate a new one
    if (!secretId) {
      secretId = crypto.randomBytes(4).toString("hex")
      await addSecret(secretId, email)
    }

    // Encrypt the secret ID for the URL
    const encryptedSecretId = encrypt(secretId)
    const loginLink = `${frontendBaseURL}/index?token=${encodeURIComponent(encryptedSecretId)}`

    // Send email
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

    await transporter.sendMail(mailOptions)
    console.log(`✅ Secure Voting Link sent to ${email}`)

    return NextResponse.json({ message: "Secure link generated and emailed!" })
  } catch (error) {
    console.error("Error generating secret:", error)
    return NextResponse.json({ message: "Server error. Please try again later." }, { status: 500 })
  }
}
