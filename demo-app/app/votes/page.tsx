"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw, Lock, CheckCircle, AlertTriangle, Database, Award, BarChart3 } from "lucide-react"

interface Vote {
  secretId: string
  encryptedVote: string
  timestamp: string
  decodedVote?: {
    candidateId: string
  }
}

// Map candidate IDs to Team 6 options
const getCandidateName = (id: string) => {
  const options = {
    "1": "Team 6",
    "2": "Also Team 6",
    "3": "Not Team 6",
  }
  return options[id as keyof typeof options] || `Option ${id}`
}

// Map candidate IDs to colors
const getCandidateColor = (id: string) => {
  const colors = {
    "1": "text-indigo-600 bg-indigo-50 border-indigo-200",
    "2": "text-purple-600 bg-purple-50 border-purple-200",
    "3": "text-blue-600 bg-blue-50 border-blue-200",
  }
  return colors[id as keyof typeof colors] || "text-gray-600 bg-gray-50 border-gray-200"
}

export default function VotesPage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const fetchVotes = async () => {
    setLoading(true)
    setError("")
    setDebugInfo(null)

    try {
      console.log("Fetching votes...")
      const response = await fetch("/api/votes")

      if (!response.ok) {
        throw new Error(`Failed to fetch votes: ${response.status}`)
      }

      const data = await response.json()
      console.log("Votes API response:", data)
      setDebugInfo(data)

      // The API now returns a success field and votes array
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch votes")
      }

      if (!data.votes || !Array.isArray(data.votes)) {
        throw new Error("Invalid response format - votes array missing")
      }

      // Try to decode the votes for display
      const processedVotes = data.votes.map((vote: Vote) => {
        try {
          const decodedString = atob(vote.encryptedVote)
          const decodedVote = JSON.parse(decodedString)
          return { ...vote, decodedVote }
        } catch (e) {
          return vote
        }
      })

      setVotes(processedVotes)
    } catch (err) {
      console.error("Error fetching votes:", err)
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVotes()
  }, [])

  // Count votes by candidate
  const voteCounts: Record<string, number> = {}
  votes.forEach((vote) => {
    if (vote.decodedVote?.candidateId) {
      const candidateId = vote.decodedVote.candidateId
      voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-white/10 to-transparent dark:from-black/10"></div>

        <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-block mb-4 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full">
                <div className="px-4 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm font-medium text-purple-800 dark:text-purple-200">
                  Anonymous Voting Results
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                Sawty Voting
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                Secure, transparent, and privacy-preserving vote tracking
              </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center mb-8">
              <Button 
                onClick={fetchVotes} 
                disabled={loading} 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Synchronizing..." : "Refresh Results"}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                  {debugInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Debug Info</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Summary cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-blue-600">
                    <Database className="h-5 w-5 mr-2" />
                    Total Votes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-4xl font-bold">{votes.length}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verified vote transactions</p>
                </CardContent>
              </Card>

              {Object.entries(voteCounts).map(([candidateId, count]) => {
                const candidateName = getCandidateName(candidateId);
                const colorClasses = getCandidateColor(candidateId);
                return (
                  <Card key={candidateId} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className={`flex items-center ${colorClasses.split(" ")[0]}`}>
                        <Award className="h-5 w-5 mr-2" />
                        {candidateName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-4xl font-bold">{count}</p>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${colorClasses.split(" ")[1].replace("bg-", "bg-")}`} 
                          style={{ width: `${votes.length ? (count / votes.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {votes.length ? ((count / votes.length) * 100).toFixed(1) : 0}% of total votes
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Vote record table */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden mb-8">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  Anonymous Vote Records
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
                    <p className="text-slate-500 dark:text-slate-400">Synchronizing with blockchain...</p>
                  </div>
                ) : votes.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-8 w-8 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-500 dark:text-slate-400">No votes have been cast yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-700">
                          <TableHead className="text-slate-600 dark:text-slate-400">Vote For</TableHead>
                          <TableHead className="text-slate-600 dark:text-slate-400">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {votes.map((vote, index) => {
                          const candidateId = vote.decodedVote?.candidateId || "";
                          const candidateName = vote.decodedVote?.candidateId ? getCandidateName(vote.decodedVote.candidateId) : "Encrypted";
                          const colorClasses = getCandidateColor(candidateId);
                          
                          return (
                            <TableRow key={index} className="border-slate-200 dark:border-slate-700">
                              <TableCell>
                                <div className="flex items-center">
                                  {vote.decodedVote?.candidateId ? (
                                    <>
                                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
                                        {candidateName}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-center text-amber-600 dark:text-amber-400">
                                        <Lock className="h-3 w-3 mr-1" />
                                        <span className="text-xs">Encrypted</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-slate-700 dark:text-slate-300 text-sm">{new Date(vote.timestamp).toLocaleDateString()}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(vote.timestamp).toLocaleTimeString()}</div>
                              </TableCell>
                            </TableRow>
                          )}
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blockchain visualization */}
            {votes.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-center">
                  <Database className="h-5 w-5 mr-2 text-purple-600" />
                  Anonymous Block Sequence
                </h2>
                <div className="flex flex-nowrap overflow-x-auto pb-6 pt-2 space-x-3 px-4">
                  {votes.map((vote, i) => {
                    const candidateId = vote.decodedVote?.candidateId || "";
                    const candidateName = vote.decodedVote?.candidateId ? getCandidateName(vote.decodedVote.candidateId) : "Encrypted";
                    const colorClasses = getCandidateColor(candidateId);
                    
                    return (
                      <div 
                        key={i} 
                        className="flex-shrink-0 w-40 rounded-lg border bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 flex flex-col justify-between shadow-md relative"
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            Block #{i+1}
                          </div>
                          {vote.decodedVote?.candidateId && (
                            <div className={`w-2 h-2 rounded-full ${colorClasses.split(" ")[1].replace("bg-", "bg-")}`}></div>
                          )}
                        </div>
                        
                        <div className="my-2">
                          {vote.decodedVote?.candidateId ? (
                            <div className={`mt-1 px-2 py-0.5 rounded text-xs font-medium ${colorClasses} inline-block`}>
                              {candidateName}
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center text-amber-600 dark:text-amber-400">
                              <Lock className="h-3 w-3 mr-1" />
                              <span className="text-xs">Encrypted</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {new Date(vote.timestamp).toLocaleString()}
                        </div>
                        
                        {i < votes.length - 1 && (
                          <div className="absolute right-[-12px] top-1/2 transform -translate-y-1/2 text-purple-400 dark:text-purple-600 z-10">→</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
