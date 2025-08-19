// This component is not a client component
'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="mt-4">Something went wrong!</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Please try again. If the problem persists, contact support.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <pre className="p-4 rounded-md bg-muted text-sm whitespace-pre-wrap text-left">
                        <code>{error.message || "An unknown error occurred."}</code>
                    </pre>
                    <Button onClick={() => reset()}>
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
      </body>
    </html>
  )
}
