"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { useExpense } from "@/contexts/expense-context"

interface CreditLimitChartProps {
  used: number
  limit: number
  className?: string
}

export function CreditLimitChart({ used, limit, className }: CreditLimitChartProps) {
  const { formatCurrency, currency } = useExpense()

  const pct = Math.min(100, Math.round((used / limit) * 100))
  const available = Math.max(0, limit - used)

  const data = [
    { name: "Used", value: Math.min(used, limit) },
    { name: "Available", value: available },
  ]

  // Color based on usage level
  const usedColor =
    pct >= 80
      ? "hsl(var(--destructive))"
      : pct >= 50
        ? "hsl(38, 92%, 50%)" // amber
        : "hsl(var(--primary))"

  const availableColor = "hsl(var(--muted))"

  const statusLabel = pct >= 80 ? "Near limit" : pct >= 50 ? "Moderate" : "Healthy"
  const statusClass =
    pct >= 80
      ? "text-destructive"
      : pct >= 50
        ? "text-amber-500"
        : "text-primary"

  const fmtCompact = (n: number) => {
    const abs = Math.abs(n)
    if (abs >= 1_000_000) return currency.symbol + (abs / 1_000_000).toFixed(1) + "M"
    if (abs >= 100_000) return currency.symbol + (abs / 1_000).toFixed(0) + "k"
    return currency.symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      {/* Donut chart */}
      <div className="relative w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={usedColor} />
              <Cell fill={availableColor} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xs sm:text-sm font-bold tabular-nums", statusClass)}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: usedColor }} />
          <span className="text-xs text-muted-foreground">Used</span>
          <span className="text-xs font-medium text-foreground ml-auto tabular-nums truncate">
            <span className="sm:hidden">{fmtCompact(used)}</span>
            <span className="hidden sm:inline">{formatCurrency(used)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 shrink-0 rounded-full bg-muted" />
          <span className="text-xs text-muted-foreground">Available</span>
          <span className="text-xs font-medium text-foreground ml-auto tabular-nums truncate">
            <span className="sm:hidden">{fmtCompact(available)}</span>
            <span className="hidden sm:inline">{formatCurrency(available)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className={cn("text-[11px] font-medium", statusClass)}>
            {statusLabel}
          </span>
          <span className="text-[11px] text-muted-foreground ml-auto truncate">
            of <span className="sm:hidden">{fmtCompact(limit)}</span><span className="hidden sm:inline">{formatCurrency(limit)}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
