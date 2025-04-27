"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, ShieldAlert, XCircle, Database, Lock } from "lucide-react"
import Link from "next/link"
import { generateForAll } from "@/lib/api"
import { Input } from "@/components/ui/input"

interface ResultEntry {
  email: string
  status: "success" | "failed"
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ResultEntry[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // Simple admin authentication - in a real app, use a proper auth system
  const adminPassword = "sawty-admin-2023" // This would be an environment variable in production

  useEffect(() => {
    // Check if user came directly to this URL
    const referrer = document.referrer
    const isDirectAccess = !referrer || !referrer.includes(window.location.hostname)

    if (!isDirectAccess) {
      // If user navigated from within the site, redirect to home
      router.push("/")
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Invalid password")
    }
  }

  const handleGenerateForAll = async () => {
    setLoading(true)
    setShowResults(false)

    try {
      const { success, data } = await generateForAll()

      if (success) {
        setResults(data.results)
        setShowResults(true)
      } else {
        alert("Failed to generate Digital Signatures. Please try again later.")
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="max-w-md w-full border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="mx-auto bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-fit">
              <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-2xl text-center">Admin Authentication</CardTitle>
            <CardDescription className="text-center">Enter the admin password to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto py-12">
        <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              >
                Admin Only
              </Badge>
            </div>
            <CardTitle className="text-3xl">Sawty Admin Dashboard</CardTitle>
            <CardDescription>
              Send Digital Signatures to all registered voters for secure access to the voting platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGenerateForAll}
                disabled={loading}
                size="lg"
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Mail className="h-5 w-5" />
                {loading ? "Processing..." : "Generate & Send Digital Signatures"}
              </Button>

              <Link href="/votes">
                <Button variant="outline" size="lg" className="gap-2 border-purple-200 dark:border-purple-800">
                  <Database className="h-5 w-5" />
                  View Blockchain Votes
                </Button>
              </Link>
            </div>

            {showResults && (
              <div className="space-y-4">
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <AlertTitle>Operation Complete</AlertTitle>
                  <AlertDescription>Digital Signatures have been generated and sent to registered voters.</AlertDescription>
                </Alert>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.email}</TableCell>
                          <TableCell className="text-right">
                            {entry.status === "success" ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0">
                                <CheckCircle className="h-3 w-3 mr-1" /> Sent
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="border-0">
                                <XCircle className="h-3 w-3 mr-1" /> Failed
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
