import { NextResponse } from "next/server"
import { addSecret } from "@/lib/store"
import { getKV } from "@/lib/kv-storage"

// This endpoint is for development/testing only
// In production, this should be protected or removed
export async function POST(request: Request) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: "Not available in production" }, { status: 403 })
    }

    const { secretId, email } = await request.json()

    if (!secretId || !email) {
      return NextResponse.json({ message: "Secret ID and email are required." }, { status: 400 })
    }

    // Add the secret
    await addSecret(secretId, email)
    
    // Verify it was saved
    const savedEmail = await getKV<string>(`secret:${secretId}`)
    const savedSecretId = await getKV<string>(`email:${email}`)

    return NextResponse.json({ 
      message: "Test secret added successfully",
      secretId,
      email,
      verification: {
        savedEmail,
        savedSecretId,
        matches: savedEmail === email && savedSecretId === secretId
      }
    })
  } catch (error) {
    console.error("Error adding debug secret:", error)

    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error)

    return NextResponse.json(
      {
        message: "Error adding secret. See server logs.",
        error: errorMessage,
      },
      { status: 500 },
    )
  }
} 