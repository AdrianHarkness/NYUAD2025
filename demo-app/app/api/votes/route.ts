import { NextResponse } from "next/server"
import { getAllVotes } from "@/lib/store"

export async function GET() {
  try {
    // Get all votes
    const votes = await getAllVotes()
    
    return NextResponse.json({ 
      success: true, 
      votes,
      count: votes.length
    })
  } catch (error) {
    console.error("Error fetching votes:", error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to fetch votes",
        error: errorMessage
      }, 
      { status: 500 }
    )
  }
}
