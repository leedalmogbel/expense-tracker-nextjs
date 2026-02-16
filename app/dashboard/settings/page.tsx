"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useExpense } from "@/contexts/expense-context"
import { CURRENCIES } from "@/lib/constants"
import { buildCsv, downloadCsv } from "@/lib/export-csv"
import { syncToSupabase } from "@/lib/sync-to-supabase"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Download, CloudUpload, Plus, Trash2 } from "lucide-react"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SettingsPage() {
  const {
    transactions,
    currentBudget,
    currency,
    setCurrency,
    paymentMethods,
    customPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
  } = useExpense()
  const [supabaseOpen, setSupabaseOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [newPaymentMethod, setNewPaymentMethod] = useState("")

  const handleExportCsv = () => {
    const csv = buildCsv(transactions, currentBudget, currency)
    const name = `doshmate-export-${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(csv, name)
  }

  const handleSyncToSupabase = async () => {
    const trimmed = email.trim()
    if (!EMAIL_REGEX.test(trimmed)) {
      setSyncError("Please enter a valid email address.")
      return
    }
    setSyncError(null)
    setSyncing(true)
    const result = await syncToSupabase(transactions, currentBudget, currency, trimmed)
    setSyncing(false)
    if (result.success) {
      setSyncSuccess(true)
      setTimeout(() => {
        setSupabaseOpen(false)
        setSyncSuccess(false)
        setEmail("")
      }, 2000)
    } else {
      setSyncError(result.error ?? "Sync failed")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className=" p-6 lg:p-8">
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Currency, payment methods, export, and sync.
        </p>

        <div className="mt-8 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading">Currency</CardTitle>
              <CardDescription>
                Choose the currency used for amounts across the app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <select
                aria-label="Currency"
                value={currency?.code ?? ""}
                onChange={(e) => {
                  const c = CURRENCIES.find((x) => x.code === e.target.value)
                  if (c) setCurrency(c)
                }}
                className="max-w-xs h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading">Payment methods</CardTitle>
              <CardDescription>
                Add or remove payment methods. Default methods cannot be removed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. PayPal, Venmo"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addPaymentMethod(newPaymentMethod)
                      setNewPaymentMethod("")
                    }
                  }}
                  className="max-w-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    addPaymentMethod(newPaymentMethod)
                    setNewPaymentMethod("")
                  }}
                  disabled={!newPaymentMethod.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => {
                  const isCustom = customPaymentMethods.includes(method)
                  return (
                    <li
                      key={method}
                      className="flex items-center gap-1 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm"
                    >
                      <span>{method}</span>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => removePaymentMethod(method)}
                          className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${method}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-heading">Export data</CardTitle>
              <CardDescription>
                Download your transactions and budget as a CSV file. Same format as the mobile app
                export.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportCsv} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Save to CSV
              </Button>
            </CardContent>
          </Card>

          {isSupabaseConfigured() && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading">Sync to cloud</CardTitle>
                <CardDescription>
                  Back up your data to Supabase. Enter your email to associate this device with your
                  export.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setSupabaseOpen(true)} className="gap-2">
                  <CloudUpload className="h-4 w-4" />
                  Save to Supabase
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={supabaseOpen} onOpenChange={setSupabaseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Sync to Supabase</DialogTitle>
            <DialogDescription>
              Enter your email to associate this export with your account. Your data will be
              uploaded to your Supabase project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sync-email">Email</Label>
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
              />
              {syncError && (
                <p className="text-sm text-destructive">{syncError}</p>
              )}
              {syncSuccess && (
                <p className="text-sm text-primary">Sync successful. You can close this dialog.</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSupabaseOpen(false)}
              disabled={syncing}
            >
              Cancel
            </Button>
            <Button onClick={handleSyncToSupabase} disabled={syncing}>
              {syncing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                "Sync"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
