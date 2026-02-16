"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useExpense } from "@/contexts/expense-context"

export function CategoryBreakdown() {
  const { categoryBreakdown, currency } = useExpense()
  const total = categoryBreakdown.reduce((sum, item) => sum + item.value, 0)

  if (categoryBreakdown.length === 0) {
    return (
      <Card className="border-border text-card-foreground">
        <CardHeader className="p-4 pb-2 sm:p-6">
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-sm text-muted-foreground">Add expenses to see spending by category.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader className="p-4 pb-2 sm:p-6">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Spending by Category
        </CardTitle>
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
}
