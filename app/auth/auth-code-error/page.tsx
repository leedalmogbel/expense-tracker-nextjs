import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Sign-in link invalid or expired
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          The sign-in link may have been used already or expired. Please try signing in again.
        </p>
      </div>
      <Button asChild>
        <Link href="/login">Try again</Link>
      </Button>
    </div>
  )
}
