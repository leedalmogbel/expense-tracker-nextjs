"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useExpense } from "@/contexts/expense-context"
import { BarChart3 } from "lucide-react"

export const AnalyticsBarChart = memo(function AnalyticsBarChart() {
  const { chartData7Months, currency, selectedMonthFilter, setSelectedMonthFilter, setSelectedDate, setDateRangeFilter } = useExpense()

  return (
    <Card className="w-full border-border">
      <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border">
        <div className="flex flex-wrap items-start justify-between gap-3 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Monthly Comparison
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 7 months &middot; Click a bar to filter
              </p>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4 text-xs shrink-0 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-4))]" />
              <span className="text-muted-foreground">Expenses</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-4 text-foreground">
        <div className="h-[240px] sm:h-[280px] w-full min-w-0 text-muted-foreground">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData7Months}
              margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
              barCategoryGap="20%"
              barGap={2}
              onClick={(state) => {
                if (state?.activePayload?.[0]?.payload) {
                  const { year: y, monthNum: m } = state.activePayload[0].payload
                  const isAlreadySelected = selectedMonthFilter?.year === y && selectedMonthFilter?.month === m
                  setSelectedDate(null)
                  setDateRangeFilter(null)
                  setSelectedMonthFilter(isAlreadySelected ? null : { year: y, month: m })
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 13 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 13 }}
                tickFormatter={(v) => `${currency.symbol}${v / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value: number, name: string) => [
                  `${currency.symbol}${Number(value).toLocaleString()}`,
                  name === "income" ? "Income" : "Expenses",
                ]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload ? `${payload[0].payload.month} ${payload[0].payload.year}` : label
                }
              />
              <Bar
                dataKey="income"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="income"
                className="cursor-pointer"
                opacity={0.85}
              />
              <Bar
                dataKey="expenses"
                fill="hsl(var(--chart-4))"
                radius={[4, 4, 0, 0]}
                name="expenses"
                className="cursor-pointer"
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {selectedMonthFilter && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Showing transactions for{" "}
            {new Date(selectedMonthFilter.year, selectedMonthFilter.month - 1, 1).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
            {" "}
            <button
              type="button"
              onClick={() => setSelectedMonthFilter(null)}
              className="text-primary hover:underline font-medium"
            >
              Clear filter
            </button>
          </p>
        )}
      </CardContent>
    </Card>
  )
})
