"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import { submitVote } from "@/lib/api"

// Mock candidate data - replace with your actual data
const candidates = [
  {
    id: "1",
    name: "Team 6",
    party: "Transparency Party",
    image: "/images/team6-member1.png?height=300&width=300",
  },
  {
    id: "2",
    name: "Also team 6",
    party: "Fair voting Party",
    image: "/images/team6-member2.png?height=300&width=300",
  },
  {
    id: "3",
    name: "Not Team 6",
    party: "Vote Team 6!",
    image: "/images/team6-member3.png?height=300&width=300",
  },
]

export default function ConfirmVotePage() {
  const router = useRouter()
  const [candidate, setCandidate] = useState<any>(null)
  const [secretId, setSecretId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let storedSecretId: string | null = null
    let selectedCandidateId: string | null = null
  
    if (typeof window !== "undefined") {
      storedSecretId = localStorage.getItem("secretId")
      selectedCandidateId = localStorage.getItem("selectedCandidate")
    }
  
    // Check if user is authenticated and has selected a candidate
    if (!storedSecretId) {
      router.push("/")
      return
    }
  
    if (!selectedCandidateId) {
      router.push("/candidates")
      return
    }
  
    setSecretId(storedSecretId)
  
    // Find the candidate based on the stored ID
    const foundCandidate = candidates.find((c) => c.id === selectedCandidateId)
    if (foundCandidate) {
      setCandidate(foundCandidate)
    } else {
      router.push("/candidates")
    }
  }, [router])

  const handleConfirmVote = async () => {
    if (!secretId || !candidate) return

    setLoading(true)
    setError("")

    try {
      // Encrypt the vote (in a real app, this would be more secure)
      const encryptedVote = btoa(JSON.stringify({ candidateId: candidate.id }))

      const { success, data } = await submitVote(secretId, encryptedVote)

      if (success) {
        setSuccess(true)
        // Clear the selected candidate but keep the secret ID for reference
        localStorage.removeItem("selectedCandidate")
      } else {
        setError(data.message || "Failed to submit vote. Please try again.")
      }
    } catch (err) {
      setError("Server error. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    router.push("/candidates")
  }

  const handleFinish = () => {
    // Clear all data and go to home
    localStorage.clear()
    router.push("/")
  }

  if (!candidate) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {!success ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Confirm Your Vote</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Please review your selection before submitting your final vote.
              </p>
            </div>

            <Card className="mb-8 overflow-hidden border-0 shadow-lg">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 md:h-auto md:w-1/3">
                  <Image
                    src={candidate.image || "/placeholder.svg"}
                    alt={candidate.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <CardContent className="flex-1 p-6">
                  <h2 className="text-2xl font-bold mb-2">{candidate.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">{candidate.party}</p>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Your vote is final and cannot be changed once submitted. Please ensure this is your intended
                        choice.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="md:flex-1 md:max-w-[200px]"
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>

              <Button
                onClick={handleConfirmVote}
                className="md:flex-1 md:max-w-[200px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Vote"}
              </Button>
            </div>
          </>
        ) : (
          <Card className="text-center p-8 border-0 shadow-lg">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h1 className="text-3xl font-bold mb-4">Vote Submitted Successfully!</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Thank you for participating in this election. Your vote has been securely recorded.
              </p>
              <Button
                onClick={handleFinish}
                className="px-8 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Finish
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
