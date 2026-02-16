"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useExpense } from "@/contexts/expense-context"

export function AnalyticsBarChart() {
  const { chartData7Months, currency, selectedMonthFilter, setSelectedMonthFilter, year, month } = useExpense()
  const currentMonthKey = `${year}-${month}`

  return (
    <Card className="border-border">
      <CardHeader className="p-4 pb-2 sm:p-6">
        <CardTitle className="font-heading text-base font-semibold text-foreground">
          Analytics
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Last 7 months · Click a bar to filter transactions
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-4 text-foreground">
        <div className="h-[240px] sm:h-[280px] w-full min-w-0 text-muted-foreground [color:hsl(var(--muted-foreground))]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData7Months}
              margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
              onClick={(state) => {
                if (state?.activePayload?.[0]?.payload) {
                  const { year: y, monthNum: m } = state.activePayload[0].payload
                  setSelectedMonthFilter(
                    selectedMonthFilter?.year === y && selectedMonthFilter?.month === m
                      ? null
                      : { year: y, month: m }
                  )
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
                }}
                formatter={(value: number) => [`${currency.symbol}${Number(value).toLocaleString()}`, "Expenses"]}
                labelFormatter={(label, payload) => payload?.[0]?.payload ? `${payload[0].payload.month} ${payload[0].payload.year}` : label}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Expenses">
                {chartData7Months.map((entry, index) => (
                  <Cell
                    key={entry.monthKey}
                    fill={
                      selectedMonthFilter?.year === entry.year && selectedMonthFilter?.month === entry.monthNum
                        ? "hsl(var(--primary))"
                        : entry.monthKey === currentMonthKey
                          ? "hsl(var(--primary))"
                          : "hsl(var(--chart-4))"
                    }
                    opacity={
                      selectedMonthFilter?.year === entry.year && selectedMonthFilter?.month === entry.monthNum
                        ? 1
                        : entry.monthKey === currentMonthKey
                          ? 0.9
                          : 0.6
                    }
                    className="cursor-pointer"
                  />
                ))}
              </Bar>
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
}
