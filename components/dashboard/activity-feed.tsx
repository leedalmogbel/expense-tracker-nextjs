"use client"

import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { getCategoryIconComponent } from "@/lib/category-icons"
import { ChevronRight, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { format, parseISO, isToday, isYesterday } from "date-fns"

function formatActivityDate(dateStr: string): { primary: string; secondary: string } {
  const d = parseISO(dateStr)
  if (isToday(d)) return { primary: "Today", secondary: format(d, "EEEE, MMM d") }
  if (isYesterday(d)) return { primary: "Yesterday", secondary: format(d, "EEEE, MMM d") }
  return { primary: format(d, "MMM d"), secondary: format(d, "EEEE") }
}

export const ActivityFeed = memo(function ActivityFeed() {
  const { transactions, formatCurrency } = useExpense()

  const recentActivity = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setDate(now.getDate() - 10)
    const cutoffStr = format(cutoff, "yyyy-MM-dd")

    const recent = transactions
      // .filter((t) => t.date >= cutoffStr)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)

    const byDate: Record<string, typeof recent> = {}
    recent.forEach((t) => {
      if (!byDate[t.date]) byDate[t.date] = []
      byDate[t.date].push(t)
    })

    return Object.entries(byDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, txs]) => ({
        date,
        ...formatActivityDate(date),
        transactions: txs,
        dayNet: txs.reduce((sum, t) => sum + t.amount, 0),
      }))
  }, [transactions])

  const totalTransactions = recentActivity.reduce((sum, g) => sum + g.transactions.length, 0)

  if (recentActivity.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Activity className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No recent activity</p>
          <p className="text-xs text-muted-foreground mt-1">
            Transactions from the last 10 recents will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-border overflow-hidden">
      <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Recent Activity
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalTransactions} transaction{totalTransactions !== 1 ? "s" : ""} &middot; Latest first
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/transactions"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:text-primary sm:text-sm sm:px-4 sm:py-2"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recentActivity.map((group, gi) => (
          <div key={group.date} className={cn(gi > 0 && "border-t border-border")}>
            {/* Date header */}
            <div className="flex items-center justify-between bg-muted/30 dark:bg-muted/10 px-4 py-2.5 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{group.primary}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">{group.secondary}</span>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium tabular-nums",
                  group.dayNet >= 0
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {group.dayNet >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatCurrency(group.dayNet)}
              </span>
            </div>
            {/* Transactions */}
            {group.transactions.map((tx, ti) => {
              const Icon = getCategoryIconComponent(tx.icon)
              const isIncome = tx.amount > 0
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: ti * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-3 transition-colors hover:bg-muted/20 active:bg-muted/40"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      isIncome
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/80 dark:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground leading-tight">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-muted-foreground truncate">{tx.category}</span>
                      {tx.paymentMethod && (
                        <>
                          <span className="text-[10px] text-muted-foreground/40">&bull;</span>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {tx.paymentMethod}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums shrink-0",
                      isIncome ? "text-primary" : "text-foreground"
                    )}
                  >
                    {formatCurrency(tx.amount)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        ))}
        <div className="border-t border-border px-4 sm:px-6 py-3">
          <Link
            href="/dashboard/transactions"
            className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1"
          >
            View all transactions <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
})
