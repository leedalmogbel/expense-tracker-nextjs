"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { getCategoryIconComponent } from "@/lib/category-icons"
import { Activity, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO, isToday, isYesterday } from "date-fns"
import type { ActivityLogEntry } from "@/lib/supabase-api"

function formatActivityDate(dateStr: string): { primary: string; secondary: string } {
  const d = parseISO(dateStr)
  if (isToday(d)) return { primary: "Today", secondary: format(d, "EEEE, MMM d") }
  if (isYesterday(d)) return { primary: "Yesterday", secondary: format(d, "EEEE, MMM d") }
  return { primary: format(d, "MMM d"), secondary: format(d, "EEEE") }
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ActivityTimeline({ entries }: { entries: ActivityLogEntry[] }) {
  const { formatCurrency } = useExpense()

  const grouped = useMemo(() => {
    const byDate: Record<string, ActivityLogEntry[]> = {}
    entries.forEach((e) => {
      const date = e.transaction_date
      if (!byDate[date]) byDate[date] = []
      byDate[date].push(e)
    })
    return Object.entries(byDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, txs]) => ({
        date,
        ...formatActivityDate(date),
        entries: txs,
        dayNet: txs.reduce((sum, t) => (t.type === "income" ? sum + t.amount : sum - t.amount), 0),
      }))
  }, [entries])

  if (entries.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Activity className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No activity found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Transactions will appear here once added
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-border overflow-hidden">
      <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
              Activity Timeline
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {grouped.map((group, gi) => (
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
            {/* Entries */}
            {group.entries.map((entry, ti) => {
              const Icon = entry.category_icon ? getCategoryIconComponent(entry.category_icon) : Activity
              const isIncome = entry.type === "income"
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: ti * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-3 transition-colors hover:bg-muted/20"
                >
                  {/* Creator avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {getInitials(entry.creator_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground leading-tight">
                      <span className="text-primary">{entry.creator_name || "Unknown"}</span>
                      {" added "}
                      {isIncome ? "income" : "an expense"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground truncate">
                        {entry.category_name || "Uncategorized"}
                      </span>
                      {entry.note && (
                        <>
                          <span className="text-[10px] text-muted-foreground/40">&bull;</span>
                          <span className="text-[11px] text-muted-foreground truncate">{entry.note}</span>
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
                    {isIncome ? "+" : "-"}{formatCurrency(entry.amount)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
