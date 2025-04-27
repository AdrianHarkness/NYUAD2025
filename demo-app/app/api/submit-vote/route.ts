import { NextResponse } from "next/server"
import { isSecretValid, removeSecret, addVote } from "@/lib/store"

export async function POST(request: Request) {
  try {
    const { secretId, encryptedVote } = await request.json()

    if (!secretId || !encryptedVote) {
      return NextResponse.json({ message: "Secret ID and vote are required." }, { status: 400 })
    }

    // Check if the secret ID is valid
    const isValid = await isSecretValid(secretId)
    if (!isValid) {
      return NextResponse.json({ message: "Invalid or expired Secret ID." }, { status: 400 })
    }

    // Save the vote
    try {
      // First add the vote before removing the secret to ensure it's saved
      await addVote({
        secretId,
        encryptedVote,
        timestamp: new Date().toISOString(),
      })

      // Only remove the secret ID after vote is saved to prevent double voting
      try {
        await removeSecret(secretId)
      } catch (secretError) {
        // Log but don't fail the request if removing the secret fails
        // The vote was still recorded successfully
        console.error("Warning: Failed to remove secret after vote:", secretError)
      }

      return NextResponse.json({ 
        message: "Vote submitted securely!",
        status: 200
      })
    } catch (error) {
      console.error("Error saving vote:", error)

      const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error)

      return NextResponse.json(
        {
          message: "Error saving vote. Please try again.",
          error: errorMessage,
          status: 500
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error submitting vote:", error)

    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error)

    return NextResponse.json(
      {
        message: "Server error. Please try again later.",
        error: errorMessage,
        status: 500
      },
      { status: 500 },
    )
  }
}
