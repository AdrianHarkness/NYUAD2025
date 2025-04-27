"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, KeyRound, Mail } from "lucide-react"
import { verifySecretId, requestSecretId } from "@/lib/api"
import { decrypt } from "@/lib/encryption"

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [digitalSignature, setDigitalSignature] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Check for token in URL - only autofill, don't auto-submit
  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      try {
        // Decrypt the token to get the digital signature
        const decryptedDigitalSignature = decrypt(token)
        setDigitalSignature(decryptedDigitalSignature)
        // No auto-submit
      } catch (err) {
        console.error("Error decrypting token:", err)
        setError("Invalid or expired token. Please request a new one.")
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!digitalSignature) {
      setError("Please enter your Digital Signature")
      return
    }

    setLoading(true)

    try {
      const { success, data } = await verifySecretId(digitalSignature)

      if (success && data.valid) {
        // Store the digital signature in localStorage
        localStorage.setItem("secretId", digitalSignature)
        router.push("/candidates")
      } else {
        setError(data.message || "Invalid or expired Digital Signature")
      }
    } catch (err) {
      setError("Server error. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendDigitalSignature = async () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-white/10 to-transparent dark:from-black/10"></div>

        <div className="container mx-auto px-3 py-8 sm:px-4 sm:py-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4 sm:mb-6 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full">
              <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-200">
                Secure Anonymous Voting
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
              Welcome to Sawty Voting
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8">
              Your secure, transparent, and privacy-preserving voting platform
            </p>

            <div className="max-w-md mx-auto mb-6">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6">
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="digital-signature">Enter Your Digital Signature</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="digital-signature"
                          type="text"
                          placeholder="Enter your Digital Signature"
                          value={digitalSignature}
                          onChange={(e) => setDigitalSignature(e.target.value)}
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
                      {loading ? "Verifying..." : "Access Voting"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs sm:text-sm py-0"
                      onClick={handleResendDigitalSignature}
                    >
                      <Mail className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      Lost your Digital Signature? Click here to resend it
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
