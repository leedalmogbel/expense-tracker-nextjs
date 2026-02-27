"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getInviteById, acceptInvite } from "@/lib/supabase-api"
import { Users, CheckCircle2, XCircle, Loader2 } from "lucide-react"

type InviteData = {
  id: string
  household_id: string
  email: string
  role: string
  status: string
  households?: { name: string } | null
}

type PageState = "loading" | "sign-in" | "accepting" | "accepted" | "error"

function InviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading, signInWithGoogle, isSupabaseConfigured } = useAuth()

  const inviteId = searchParams.get("id")
  const [state, setState] = useState<PageState>("loading")
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  // Fetch invite details
  useEffect(() => {
    if (!inviteId) {
      setState("error")
      setErrorMessage("No invite ID provided.")
      return
    }
    if (!isSupabaseConfigured) {
      setState("error")
      setErrorMessage("Cloud sync is not configured.")
      return
    }
    getInviteById(inviteId).then(({ invite: data, error }) => {
      if (error || !data) {
        setState("error")
        setErrorMessage("This invite link is invalid or has expired.")
        return
      }
      if (data.status !== "pending") {
        setState("error")
        setErrorMessage("This invite has already been used.")
        return
      }
      setInvite(data)
      if (authLoading) return
      if (user) {
        setState("accepting")
      } else {
        setState("sign-in")
      }
    })
  }, [inviteId, isSupabaseConfigured, authLoading, user])

  const doAccept = useCallback(async () => {
    if (!invite || !user) return
    setState("accepting")
    const { error } = await acceptInvite(invite.id, user.id)
    if (error) {
      setState("error")
      setErrorMessage(error)
      return
    }
    setState("accepted")
    setTimeout(() => router.push("/dashboard"), 2000)
  }, [invite, user, router])

  useEffect(() => {
    if (state === "accepting" && invite && user) {
      doAccept()
    }
  }, [state, invite, user, doAccept])

  const handleSignIn = () => {
    if (!inviteId) return
    signInWithGoogle({ redirectTo: `/auth/invite?id=${inviteId}` })
  }

  const householdName = invite?.households?.name ?? "a household"

  return (
    <Card className="w-full max-w-md border-border">
      <CardContent className="p-6 sm:p-8">
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading invite...</p>
          </div>
        )}

        {state === "sign-in" && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">You&apos;ve been invited!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;ve been invited to join <span className="font-medium text-foreground">{householdName}</span> as
                a <span className="font-medium text-foreground">{invite?.role ?? "member"}</span>.
              </p>
            </div>
            <Button onClick={handleSignIn} className="w-full rounded-lg" size="lg">
              Continue with Google
            </Button>
            <p className="text-xs text-muted-foreground">
              Sign in to accept this invitation and start collaborating.
            </p>
          </div>
        )}

        {state === "accepting" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Joining {householdName}...</p>
          </div>
        )}

        {state === "accepted" && (
          <div className="flex flex-col items-center gap-5 text-center py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">You&apos;re in!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;ve joined <span className="font-medium text-foreground">{householdName}</span>.
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-5 text-center py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
              <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="rounded-lg">
              Go to Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function InviteAcceptPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md border-border">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading invite...</p>
              </div>
            </CardContent>
          </Card>
        }
      >
        <InviteContent />
      </Suspense>
    </div>
  )
}
