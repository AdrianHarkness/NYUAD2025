"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DebugPanel() {
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
  const [secretId, setSecretId] = useState(localStorage.getItem("secretId") || "")
  const [candidateId, setCandidateId] = useState(localStorage.getItem("selectedCandidate") || "")
  const [response, setResponse] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setError("")
    setResponse("")

    try {
      const res = await fetch(`${apiUrl}/__debug`, {
        method: "GET",
      })

      if (res.ok) {
        const text = await res.text()
        setResponse(`Connection successful: ${text}`)
      } else {
        setError(`Connection failed with status: ${res.status}`)
      }
    } catch (err) {
      setError(`Connection error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const testVoteSubmission = async () => {
    if (!secretId || !candidateId) {
      setError("Secret ID and Candidate ID are required")
      return
    }

    setLoading(true)
    setError("")
    setResponse("")

    try {
      const encryptedVote = btoa(JSON.stringify({ candidateId }))

      const res = await fetch(`${apiUrl}/api/submit-vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secretId, encryptedVote }),
      })

      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))

      if (!res.ok) {
        setError(`Vote submission failed with status: ${res.status}`)
      }
    } catch (err) {
      setError(`Vote submission error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const testSecretVerification = async () => {
    if (!secretId) {
      setError("Secret ID is required")
      return
    }

    setLoading(true)
    setError("")
    setResponse("")

    try {
      const res = await fetch(`${apiUrl}/api/verify-secret`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secretId }),
      })

      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))

      if (!res.ok) {
        setError(`Secret verification failed with status: ${res.status}`)
      }
    } catch (err) {
      setError(`Secret verification error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>API Debugging Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">API URL</Label>
          <Input
            id="api-url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:3000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secret-id">Secret ID</Label>
          <Input
            id="secret-id"
            value={secretId}
            onChange={(e) => setSecretId(e.target.value)}
            placeholder="Enter secret ID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="candidate-id">Candidate ID</Label>
          <Input
            id="candidate-id"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            placeholder="Enter candidate ID"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={testConnection} disabled={loading}>
            Test Connection
          </Button>
          <Button onClick={testVoteSubmission} disabled={loading}>
            Test Vote Submission
          </Button>
          <Button onClick={testSecretVerification} disabled={loading}>
            Test Secret Verification
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {response && (
          <div className="space-y-2">
            <Label htmlFor="response">Response</Label>
            <Textarea id="response" value={response} readOnly className="h-40 font-mono text-sm" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
