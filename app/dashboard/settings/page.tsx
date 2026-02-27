"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useExpense } from "@/contexts/expense-context"
import { useAuth } from "@/contexts/auth-context"
import { CURRENCIES } from "@/lib/constants"
import { buildCsv, downloadCsv } from "@/lib/export-csv"
import { syncToSupabase } from "@/lib/sync-to-supabase"
import { syncToHousehold } from "@/lib/supabase-api"
import { isSupabaseConfigured } from "@/lib/supabase"
import { staggerContainer, fadeUpItem } from "@/lib/utils"
import { toast } from "sonner"
import { Select, SelectItem } from "@/components/ui/select"
import {
  Download,
  CloudUpload,
  Plus,
  Trash2,
  LogOut,
  CheckCircle2,
  Repeat,
  PiggyBank,
  Users,
  Camera,
  Shield,
  Coins,
  CreditCard,
  FileDown,
  Cloud,
  Sparkles,
  Settings,
  ChevronRight,
} from "lucide-react"
import { HouseholdSettings } from "@/components/dashboard/household-settings"

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SettingsPage() {
  const {
    transactions,
    currentBudget,
    currency,
    setCurrency,
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
  } = useExpense()
  const { user, signInWithGoogle, signOut, loading: authLoading, isSupabaseConfigured: supabaseAuthConfigured } = useAuth()
  const [supabaseOpen, setSupabaseOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [newPaymentMethod, setNewPaymentMethod] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (supabaseOpen && user?.email) setEmail(user.email)
  }, [supabaseOpen, user?.email])

  const handleExportCsv = () => {
    const csv = buildCsv(transactions, currentBudget, currency)
    const name = `doshmate-export-${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(csv, name)
    toast.success("CSV exported", { description: name })
  }

  const handleSyncToSupabase = async () => {
    setSyncError(null)
    setSyncing(true)
    let result: { success: boolean; error?: string }
    if (user) {
      result = await syncToHousehold(user.id, user.email ?? null, transactions, currentBudget)
    } else {
      const trimmed = email.trim()
      if (!EMAIL_REGEX.test(trimmed)) {
        setSyncError("Please enter a valid email address.")
        setSyncing(false)
        return
      }
      result = await syncToSupabase(transactions, currentBudget, currency, trimmed)
    }
    setSyncing(false)
    if (result.success) {
      toast.success("Data synced to cloud")
      setSyncSuccess(true)
      setTimeout(() => {
        setSupabaseOpen(false)
        setSyncSuccess(false)
        setEmail("")
      }, 2000)
    } else {
      const errorMsg = result.error ?? "Sync failed"
      toast.error("Sync failed", { description: errorMsg })
      setSyncError(errorMsg)
    }
  }

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <div className="max-w-3xl">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Settings</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage currency, payment methods, export, and cloud sync.
            </p>
          </div>
        </div>

        <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
          {/* Currency */}
          <motion.div variants={fadeUpItem}>
            <Card className="border-border">
              <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                      Currency
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Used for all amounts across the app
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
                <Select
                  aria-label="Currency"
                  placeholder="Select currency"
                  selectedKeys={currency?.code ? [currency.code] : []}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0]
                    if (typeof v === "string") {
                      const c = CURRENCIES.find((x) => x.code === v)
                      if (c) setCurrency(c)
                    }
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} textValue={`${c.symbol} ${c.name} (${c.code})`}>
                      {`${c.symbol} ${c.name} (${c.code})`}
                    </SelectItem>
                  ))}
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Methods */}
          <motion.div variants={fadeUpItem}>
            <Card className="border-border">
              <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                      Payment Methods
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {paymentMethods.length} method{paymentMethods.length !== 1 ? "s" : ""} configured
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-5 sm:px-6 sm:py-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. PayPal, Venmo"
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (newPaymentMethod.trim()) {
                          addPaymentMethod(newPaymentMethod)
                          toast.success("Payment method added", { description: newPaymentMethod.trim() })
                          setNewPaymentMethod("")
                        }
                      }
                    }}
                    className="h-10 w-full max-w-[220px] rounded-lg border border-input bg-background text-sm"
                  />
                  <Button
                    type="button"
                    className="h-10 gap-1.5 rounded-lg px-4"
                    onClick={() => {
                      if (newPaymentMethod.trim()) {
                        addPaymentMethod(newPaymentMethod)
                        toast.success("Payment method added", { description: newPaymentMethod.trim() })
                        setNewPaymentMethod("")
                      }
                    }}
                    disabled={!newPaymentMethod.trim()}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {paymentMethods.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {paymentMethods.map((method) => (
                      <div
                        key={method}
                        className="group flex items-center gap-2 rounded-lg border border-border bg-muted/30 pl-3.5 pr-1.5 py-1.5 text-sm font-medium text-foreground transition-all hover:border-primary/20 hover:bg-muted/50"
                      >
                        <span>{method}</span>
                        <button
                          type="button"
                          onClick={() => {
                            removePaymentMethod(method)
                            toast.success("Payment method removed", { description: method })
                          }}
                          className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                          aria-label={`Remove ${method}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Add at least one payment method to record transactions.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Export Data */}
          <motion.div variants={fadeUpItem}>
            <Card className="border-border">
              <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]">
                    <FileDown className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                      Export Data
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Download transactions and budget as CSV
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-4 w-full rounded-lg border border-border bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40 hover:border-primary/20 active:scale-[0.99] group text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Save to CSV</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} ready to export
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Household */}
          {isSupabaseConfigured() && user && (
            <motion.div variants={fadeUpItem}>
              <HouseholdSettings />
            </motion.div>
          )}

          {/* Cloud Sync */}
          {isSupabaseConfigured() && (
            <motion.div variants={fadeUpItem}>
              <Card className="border-border">
                <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-5))]/10 text-[hsl(var(--chart-5))]">
                      <Cloud className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                        Cloud Sync
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {user ? "Back up and sync your data" : "Sign in to enable cloud backup"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 py-5 sm:px-6 sm:py-6 space-y-3">
                  {user ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/20 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Connected</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-1.5 rounded-lg">
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    supabaseAuthConfigured && (
                      <button
                        type="button"
                        onClick={async () => {
                          setGoogleLoading(true)
                          await signInWithGoogle({ redirectTo: "/dashboard/settings" })
                          setGoogleLoading(false)
                        }}
                        disabled={googleLoading || authLoading}
                        className="flex items-center gap-4 w-full rounded-lg border border-border bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40 hover:border-primary/20 active:scale-[0.99] group text-left disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background border border-border">
                          {googleLoading || authLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                          ) : (
                            <GoogleIcon />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">Sign in with Google</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Connect to enable cloud sync</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setSupabaseOpen(true)}
                    className="flex items-center gap-4 w-full rounded-lg border border-border bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40 hover:border-primary/20 active:scale-[0.99] group text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <CloudUpload className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">Save to Supabase</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Back up transactions and budgets</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Coming Soon */}
          <motion.div variants={fadeUpItem}>
            <Card className="border-border">
              <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                      Coming Soon
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Features planned for future releases
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
                <div className="space-y-1">
                  {[
                    { icon: Repeat, title: "Recurring Transactions", desc: "Auto-log monthly bills like rent and subscriptions", color: "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]" },
                    { icon: PiggyBank, title: "Savings Goals", desc: "Track progress toward specific savings targets", color: "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]" },
                    { icon: Users, title: "Expense Splitting", desc: "Split individual expenses with friends or household", color: "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]" },
                    { icon: Camera, title: "Receipt Scanner", desc: "OCR to auto-fill expense details from photos", color: "bg-[hsl(var(--chart-5))]/10 text-[hsl(var(--chart-5))]" },
                    { icon: Shield, title: "Financial Health Score", desc: "Scoring based on savings rate and budget adherence", color: "bg-primary/10 text-primary" },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${feature.color}`}>
                        <feature.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Supabase Sync Dialog */}
      <Dialog open={supabaseOpen} onOpenChange={setSupabaseOpen}>
        <DialogContent className="sm:max-w-md gap-0 overflow-hidden rounded-xl border-border p-0 shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
              Save to Supabase
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {syncSuccess
                ? "Your data has been backed up successfully."
                : user
                  ? "Transactions and budgets will be saved to your household in Supabase."
                  : "Enter your email to associate this backup (legacy export). For household sync, sign in with Google first."}
            </DialogDescription>
          </DialogHeader>
          {!syncSuccess ? (
            <>
              <div className="space-y-4 px-6 pb-6">
                {!user && (
                  <div className="space-y-2">
                    <Label htmlFor="sync-email" className="text-sm font-medium text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="sync-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setSyncError(null)
                      }}
                      disabled={syncing}
                      className="h-11 rounded-lg border-input bg-background text-sm"
                    />
                  </div>
                )}
                {syncError && (
                  <p className="text-sm text-destructive px-6" role="alert">{syncError}</p>
                )}
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSupabaseOpen(false)}
                  disabled={syncing}
                  className="h-10 min-w-[88px] rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSyncToSupabase}
                  disabled={syncing}
                  className="h-10 min-w-[100px] rounded-lg"
                >
                  {syncing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Syncing…
                    </span>
                  ) : (
                    "Sync"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 px-6 pb-8 pt-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
              </div>
              <p className="text-center text-sm font-medium text-foreground">Sync complete</p>
              <Button
                onClick={() => {
                  setSupabaseOpen(false)
                  setSyncSuccess(false)
                  setEmail("")
                }}
                className="h-10 rounded-lg px-6"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
