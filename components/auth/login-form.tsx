"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, TrendingUp, PiggyBank, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, signInWithGoogle, loading: authLoading, isSupabaseConfigured } = useAuth()
  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  )
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const next = searchParams.get("next") ?? "/dashboard"

  useEffect(() => {
    if (authLoading) return
    if (isSupabaseConfigured && user) {
      router.replace(next.startsWith("/") ? next : "/dashboard")
    }
  }, [authLoading, user, isSupabaseConfigured, router, next])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSupabaseConfigured) {
      setGoogleError("Please sign in with Google to access your account.")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 800)
  }

  const handleGoogleSignIn = async () => {
    setGoogleError(null)
    setGoogleLoading(true)
    const { error } = await signInWithGoogle({ redirectTo: "/dashboard" })
    setGoogleLoading(false)
    if (error) setGoogleError(error.message)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden lg:flex">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-600 dark:from-primary dark:via-primary/90 dark:to-emerald-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent" />

        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 h-64 w-64 rounded-full border border-white/[0.08]" />
        <div className="absolute top-32 right-20 h-48 w-48 rounded-full border border-white/[0.05]" />
        <div className="absolute -bottom-20 -left-10 h-80 w-80 rounded-full bg-white/[0.03]" />

        <div className="relative p-10 xl:p-12">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 backdrop-blur-sm">
              <Image src="/assets/doshmate-logo.png" alt="Dosh Mate" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-xl font-bold font-heading text-white tracking-tight">Dosh Mate</span>
          </Link>
        </div>

        <div className="relative px-10 xl:px-12">
          <h2 className="font-heading text-3xl font-bold leading-tight text-white xl:text-4xl">
            Financial clarity
            <br />starts with a
            <br />single step.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70 xl:text-base">
            Join users who have transformed their relationship with money using Dosh Mate.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/90">
              <TrendingUp className="h-3 w-3" />
              Analytics
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/90">
              <PiggyBank className="h-3 w-3" />
              Savings
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/90">
              <Shield className="h-3 w-3" />
              Secure
            </div>
          </div>
        </div>

        <div className="relative px-10 pb-10 xl:px-12 xl:pb-12">
          <p className="text-xs text-white/40" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Dosh Mate. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-[55%] lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                <Image src="/assets/doshmate-logo.png" alt="Dosh Mate" width={36} height={36} className="object-contain" />
              </div>
              <span className="text-lg font-bold font-heading text-foreground tracking-tight">Dosh Mate</span>
            </Link>
          </div>

          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {isSupabaseConfigured ? "Sign in to Dosh Mate" : activeTab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {isSupabaseConfigured
                ? "Use your Google account to access your expense data."
                : activeTab === "login"
                  ? "Sign in to continue managing your finances."
                  : "Start your journey to better financial health."}
            </p>
          </div>

          {/* Google sign-in */}
          {isSupabaseConfigured && (
            <div className="mt-8">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || authLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted/50 hover:shadow-md disabled:opacity-50"
              >
                {googleLoading || authLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>
              {googleError && (
                <p className="mt-3 text-sm text-destructive">{googleError}</p>
              )}
              <p className="mt-6 text-center text-xs text-muted-foreground/70">
                Your data is private and only accessible after signing in.
              </p>
            </div>
          )}

          {!isSupabaseConfigured && (
            <>
              {/* Tab switcher */}
              <div className="mt-8 flex rounded-xl bg-muted/60 p-1">
                <button
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === "login"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === "signup"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("signup")}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {activeTab === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="h-11 pl-10 rounded-xl border-border/60 bg-card"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="h-11 pl-10 rounded-xl border-border/60 bg-card"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    {activeTab === "login" && (
                      <button type="button" className="text-xs font-medium text-primary hover:underline">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-11 pl-10 pr-10 rounded-xl border-border/60 bg-card"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 gap-2 rounded-xl text-sm font-semibold shadow-sm shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  ) : (
                    <>
                      {activeTab === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {!isSupabaseConfigured && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              {activeTab === "login" ? (
                <>
                  {"Don't have an account? "}
                  <button
                    className="font-medium text-primary hover:underline"
                    onClick={() => setActiveTab("signup")}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    className="font-medium text-primary hover:underline"
                    onClick={() => setActiveTab("login")}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
