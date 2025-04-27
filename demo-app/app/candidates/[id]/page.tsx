"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Vote } from "lucide-react"

// Mock candidate data - replace with your actual data
const candidates = [
  {
    id: "1",

    name: "Team 6",
    party: "Transparency party",
    image: "/images/team6-member1.png",
    shortDescription: "Building innovative web solutions with modern frameworks.",
    fullDescription:
      "Team 6 has been developing cutting-edge web applications for over 3 years, focusing on user experience and performance optimization. With a strong background in React and Next.js, Team 6 has successfully built scalable frontend architectures and responsive designs.",
  },
  {
    id: "2",

    name: "Also Team 6",
    party: "Quantum Computing",
    image: "/images/team6-member2.png",
    shortDescription: "Creating intelligent solutions with advanced algorithms.",
    fullDescription:
      "Also Team 6 specializes in artificial intelligence and machine learning implementations. They have developed several projects incorporating computer vision, natural language processing, and predictive analytics to solve real-world problems and enhance user experiences.",
  },
  {
    id: "3",
    name: "Absolutely Team 6",
    party: "Blockchain Technology",
    image: "/images/team6-member3.png",
    shortDescription: "Exploring decentralized solutions for secure voting systems.",
    fullDescription:
      "Absolutely Team 6 has pioneered blockchain applications for secure and transparent systems. Their expertise spans across smart contract development, decentralized applications, and cryptographic techniques to ensure data integrity and privacy in digital voting platforms.",
  },
]

export default function CandidateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [candidate, setCandidate] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated
    const secretId = localStorage.getItem("secretId")
    if (!secretId) {
      router.push("/")
      return
    }

    // Find the candidate based on the ID from the URL
    const id = params.id as string
    const foundCandidate = candidates.find((c) => c.id === id)

    if (foundCandidate) {
      setCandidate(foundCandidate)
    } else {
      router.push("/candidates")
    }
  }, [params, router])

  if (!candidate) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleSelectCandidate = () => {
    localStorage.setItem("selectedCandidate", candidate.id)
    router.push("/candidates")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 px-3 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/candidates")} className="mb-4 sm:mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Candidates
        </Button>

        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="relative h-48 sm:h-64 w-full">
            <Image src={candidate.image || "/placeholder.png"} alt={candidate.name} fill className="object-cover" />
          </div>

          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{candidate.name}</h1>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400">{candidate.party}</p>
            </div>

            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">About</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{candidate.fullDescription}</p>
            </div>

            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Key Policies</h2>
              <ul className="list-disc pl-5 space-y-1">
                {candidate.policies.map((policy: string, index: number) => (
                  <li key={index} className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                    {policy}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center mt-6 sm:mt-8">
              <Button
                onClick={handleSelectCandidate}
                className="px-4 py-2 sm:px-6 sm:py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Vote className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Select This Candidate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
