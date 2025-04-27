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
    // Check if user is authenticated and has selected a candidate
    const storedSecretId = localStorage.getItem("secretId")
    const selectedCandidateId = localStorage.getItem("selectedCandidate")

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

      // Try up to 3 times with exponential backoff
      let attempt = 0;
      let success = false;
      let data = null;
      
      while (attempt < 3 && !success) {
        attempt++;
        try {
          console.log(`Submitting vote attempt ${attempt}...`);
          const result = await submitVote(secretId, encryptedVote);
          success = result.success;
          data = result.data;
          
          if (success) {
            break;
          } else {
            // If server error, retry. If client error (400), don't retry
            const isServerError = data?.status >= 500 || !data?.status;
            if (!isServerError) break;
            
            // Wait before retry (exponential backoff: 1s, 2s, 4s)
            if (attempt < 3) {
              const delay = Math.pow(2, attempt - 1) * 1000;
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        } catch (err) {
          console.error(`Vote submission attempt ${attempt} failed:`, err);
          // Continue to next attempt
        }
      }

      if (success) {
        setSuccess(true);
        // Clear the selected candidate but keep the secret ID for reference
        localStorage.removeItem("selectedCandidate");
      } else {
        setError(data?.message || "Failed to submit vote. Please try again.");
      }
    } catch (err) {
      console.error("Vote submission error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 px-3 sm:py-8 sm:px-4">
      <div className="max-w-xl mx-auto">
        {!success ? (
          <>
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-slate-900 dark:text-white">
                Confirm Your Vote
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
                Please review your selection before submitting your final vote.
              </p>
            </div>

            <Card className="mb-6 overflow-hidden border-0 shadow-lg">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-40 sm:h-auto sm:w-1/3">
                  <Image
                    src={candidate.image || "/placeholder.svg"}
                    alt={candidate.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <CardContent className="flex-1 p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{candidate.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">{candidate.party}</p>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2 mt-0.5" />
                      <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                        Your vote is final and cannot be changed once submitted. Please ensure this is your intended
                        choice.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {error && (
              <Alert variant="destructive" className="mb-4 sm:mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="sm:flex-1 sm:max-w-[200px]"
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>

              <Button
                onClick={handleConfirmVote}
                className="sm:flex-1 sm:max-w-[200px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Vote"}
              </Button>
            </div>
          </>
        ) : (
          <Card className="text-center p-6 sm:p-8 border-0 shadow-lg">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-3 sm:mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Vote Submitted Successfully!</h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-6 sm:mb-8">
                Thank you for participating in this election. Your vote has been securely recorded.
              </p>
              <Button
                onClick={handleFinish}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
