"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { useAuth } from "@/contexts/auth-context"
import { staggerContainer, fadeUpItem } from "@/lib/utils"
import {
  UserCircle,
  Mail,
  CalendarDays,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
  BarChart3,
} from "lucide-react"
import { format } from "date-fns"

function getDisplayName(user: { email?: string; user_metadata?: Record<string, unknown> } | null): string {
  if (!user) return "Guest"
  const full = user.user_metadata?.full_name as string | undefined
  const name = user.user_metadata?.name as string | undefined
  return full?.trim() || name?.trim() || user.email?.split("@")[0] || "Guest"
}

function getInitials(displayName: string, email?: string): string {
  if (displayName && displayName !== "Guest") {
    return displayName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return (email?.[0] ?? "?").toUpperCase()
}

export default function ProfilePage() {
  const { user } = useAuth()
  const {
    transactions,
    monthlyExpenses,
    monthlyIncome,
    totalBalance,
    categoryBreakdown,
    formatCurrency,
  } = useExpense()

  const displayName = getDisplayName(user)
  const initials = getInitials(displayName, user?.email)
  const memberSince = user?.created_at
    ? format(new Date(user.created_at), "MMMM d, yyyy")
    : "N/A"

  const maxCategoryValue = categoryBreakdown.length > 0
    ? Math.max(...categoryBreakdown.map((c) => c.value))
    : 0

  const stats = [
    {
      label: "Total Transactions",
      value: transactions.length.toLocaleString(),
      icon: Receipt,
      color: "hsl(var(--chart-1))",
    },
    {
      label: "Expenses This Month",
      value: formatCurrency(monthlyExpenses),
      icon: TrendingDown,
      color: "hsl(var(--chart-2))",
    },
    {
      label: "Income This Month",
      value: formatCurrency(monthlyIncome),
      icon: TrendingUp,
      color: "hsl(var(--chart-3))",
    },
    {
      label: "Current Balance",
      value: formatCurrency(totalBalance),
      icon: Wallet,
      color: "hsl(var(--chart-4))",
    },
  ]

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <div className="max-w-3xl">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Profile
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your account info and activity overview.
            </p>
          </div>
        </div>

        <motion.div
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Personal Information */}
          <motion.div variants={fadeUpItem}>
            <Card className="border-border">
              <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]">
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                      Personal Information
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your account details
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-lg font-semibold text-foreground truncate">
                      {displayName}
                    </p>
                    {user?.email && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Summary */}
          <motion.div variants={fadeUpItem}>
            <Card className="border-border">
              <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                      Activity Summary
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your financial snapshot this month
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-border bg-card p-3 space-y-2"
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: stat.color }} />
                        </div>
                        <p className="text-lg font-bold text-foreground tabular-nums leading-tight">
                          {stat.value}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          {stat.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Spending Breakdown */}
          <motion.div variants={fadeUpItem}>
            <Card className="border-border">
              <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-5))]/10 text-[hsl(var(--chart-5))]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                      Spending Breakdown
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Top categories this month
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No expenses recorded this month yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {categoryBreakdown.map((cat) => {
                      const pct = maxCategoryValue > 0
                        ? Math.round((cat.value / maxCategoryValue) * 100)
                        : 0
                      return (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {cat.name}
                            </span>
                            <span className="text-sm font-medium text-foreground tabular-nums">
                              {formatCurrency(cat.value)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: cat.color,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
