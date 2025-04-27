import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="max-w-md w-full border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">
            Thank You for Voting!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Your vote has been securely recorded using Quantum Key Distribution (QKD)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-4 pb-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-slate-600 dark:text-slate-300">
              Your participation helps strengthen our democratic process. The results will be published after the voting
              period ends.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Link href="/">
            <Button
              size="lg"
              className="gap-2 rounded-full px-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              <Home className="h-5 w-5" /> Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
