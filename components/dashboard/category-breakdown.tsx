"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart as PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useExpense } from "@/contexts/expense-context"

export const CategoryBreakdown = memo(function CategoryBreakdown() {
  const { categoryBreakdown, currency } = useExpense()
  const total = categoryBreakdown.reduce((sum, item) => sum + item.value, 0)

  if (categoryBreakdown.length === 0) {
    return (
      <Card className="w-full border-border text-card-foreground">
        <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]">
              <PieChartIcon className="h-5 w-5" />
            </div>
            <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
              Spending by Category
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add expenses to see spending by category</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-border">
      <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
        <div className="flex items-center gap-3 w-full">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]">
            <PieChartIcon className="h-5 w-5" />
          </div>
          <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
            Spending by Category
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:flex-row">
          <div className="relative h-[180px] w-[180px] sm:h-[200px] sm:w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value: number) => [
                    `${currency.symbol}${Number(value).toLocaleString()}`,
                    undefined,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold font-heading text-foreground">
                {currency.symbol}
                {total.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="w-full flex-1 space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {currency.symbol}
                    {item.value.toLocaleString()}
                  </span>
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
