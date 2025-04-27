import { NextResponse } from "next/server"
import { getKV, setKV } from "@/lib/kv-storage"

// This endpoint is for development/testing only
// In production, this should be protected or removed
export async function GET() {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: "Not available in production" }, { status: 403 })
    }

    // Set a test value
    const testKey = "debug-kv-test"
    const testValue = new Date().toISOString()
    await setKV(testKey, testValue)
    
    // Read back the test value
    const readValue = await getKV<string>(testKey)
    
    // Check for specific keys
    const testSecretId = "test123"
    const testEmail = "test@example.com"
    
    const secretValue = await getKV<string>(`secret:${testSecretId}`)
    const emailValue = await getKV<string>(`email:${testEmail}`)
    
    return NextResponse.json({ 
      message: "KV store test",
      testWrite: {
        key: testKey,
        writtenValue: testValue,
        readValue,
        success: testValue === readValue
      },
      secretCheck: {
        key: `secret:${testSecretId}`,
        value: secretValue
      },
      emailCheck: {
        key: `email:${testEmail}`,
        value: emailValue
      }
    })
  } catch (error) {
    console.error("Error testing KV store:", error)

    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error)

    return NextResponse.json(
      {
        message: "Error querying KV store. See server logs.",
        error: errorMessage,
      },
      { status: 500 },
    )
  }
} 