"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Info, ArrowRight } from "lucide-react"

// Mock candidate data - replace with your actual data
const candidates = [
  {
    id: "1",
    name: "Team 6",
    party: "Transparency party",
    image: "/images/team6-member1.png",
    shortDescription: "Fixing voting everywhere!",
    fullDescription:
      "Making democracy democracy.",
    policies: [
      "Honesty"
    ],
  },
  {
    id: "2",
    name: "Also Team 6",
    party: "Fair voting Party",
    image: "/images/team6-member2.png",
    shortDescription: "Fixing voting everywhere!",
    fullDescription:
      "Making democracy democracy.",
    policies: [
      "Honesty"
    ],
  },
  {
    id: "3",
    name: "Not Team 6",
    party: "Vote Team 6!",
    image: "/images/team6-member3.png",
    shortDescription: "Loved all your presentations guys!",
    fullDescription:
      "Amazing amazing effort put into all the projects! Honoured to be able to see this first hand !!",
    policies: [
      "Changing the future",
    ],
  },
]


export default function CandidatesPage() {
  const router = useRouter()
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)

  // Check if user is authenticated
  useEffect(() => {
    const secretId = localStorage.getItem("secretId")
    if (!secretId) {
      router.push("/")
    }
  }, [router])

  const handleVoteNow = () => {
    if (selectedCandidate) {
      // Store selected candidate in localStorage for the confirmation page
      localStorage.setItem("selectedCandidate", selectedCandidate)
      router.push("/confirm-vote")
    }
  }

  const handleCandidateInfo = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the candidate when clicking the info button
    router.push(`/candidates/${candidateId}`) // Fixed route path
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 px-3 sm:py-8 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 text-slate-900 dark:text-white">
            Who deserves a standing ovation for their presentation?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Select a candidate by clicking on their card. Review their information before confirming your vote.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {candidates.map((candidate) => (
            <Card
              key={candidate.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
                selectedCandidate === candidate.id
                  ? "ring-2 ring-purple-500 dark:ring-purple-400 shadow-lg opacity-100"
                  : "hover:scale-102 opacity-100"
              }`}
              onClick={() => setSelectedCandidate(candidate.id)}
            >
              {/* Gray overlay for non-selected candidates when one is selected */}
              {selectedCandidate && selectedCandidate !== candidate.id && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 opacity-60 z-10"></div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 z-20 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 w-7 h-7 p-1"
                onClick={(e) => handleCandidateInfo(candidate.id, e)}
              >
                <Info className="h-4 w-4" />
                <span className="sr-only">More information</span>
              </Button>

              <div className="relative h-32 sm:h-40 w-full">
                <Image src={candidate.image || "/placeholder.png"} alt={candidate.name} fill className="object-cover" />
              </div>

              <CardContent className="p-3">
                <h3 className="font-bold text-sm sm:text-base">{candidate.name}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">{candidate.party}</p>
                <p className="text-xs sm:text-sm line-clamp-2">{candidate.shortDescription}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleVoteNow}
            disabled={!selectedCandidate}
            className={`px-6 py-2 sm:px-8 sm:py-3 rounded-full text-base sm:text-lg transition-all ${
              selectedCandidate
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            }`}
          >
            Vote Now <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
