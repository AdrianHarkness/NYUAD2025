"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react"
import { verifySecretId, requestSecretId } from "@/lib/api"
import { decrypt } from "@/lib/encryption"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [secretId, setSecretId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Check for token in URL
  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      try {
        // Decrypt the token to get the secret ID
        const decryptedSecretId = decrypt(token)
        setSecretId(decryptedSecretId)

        // Auto-submit if we have a token
        handleSubmit(null, decryptedSecretId)
      } catch (err) {
        console.error("Error decrypting token:", err)
        setError("Invalid or expired token. Please request a new one.")
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent | null, autoSecretId?: string) => {
    if (e) e.preventDefault()
    setError("")

    const idToVerify = autoSecretId || secretId

    if (!idToVerify) {
      setError("Please enter your Secret ID")
      return
    }

    setLoading(true)

    try {
      const { success, data } = await verifySecretId(idToVerify)

      if (success && data.valid) {
        // Store the secret ID in localStorage
        localStorage.setItem("secretId", idToVerify)
        router.push("/candidates")
      } else {
        setError(data.message || "Invalid or expired Secret ID")
      }
    } catch (err) {
      setError("Server error. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendSecretId = async () => {
    // In a real app, this would open a modal or form to enter email
    const email = prompt("Enter your email:")
    if (!email) return

    try {
      const { success, data } = await requestSecretId(email)
      alert(data.message)
    } catch (err) {
      alert("Failed to resend. Please try again later.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Link href="/technology" className="absolute top-4 left-4 md:top-8 md:left-8">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      </Link>

      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="mx-auto bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-fit">
              <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-2xl text-center">Sawty Secure Login</CardTitle>
            <CardDescription className="text-center">
              Enter your Secret ID to access the voting platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret-id">Secret ID</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="secret-id"
                    type="text"
                    placeholder="Enter your Secret ID"
                    value={secretId}
                    onChange={(e) => setSecretId(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="w-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={handleResendSecretId}
            >
              <Mail className="mr-2 h-4 w-4" />
              Lost your Secret ID? Click here to resend it
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
