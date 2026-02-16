"use client"

import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BudgetExpenseCards } from "@/components/dashboard/budget-expense-cards"
import { StatCards } from "@/components/dashboard/stat-cards"
import { WeekCalendar } from "@/components/dashboard/week-calendar"
import { AnalyticsBarChart } from "@/components/dashboard/analytics-bar-chart"
import { OverviewRecent } from "@/components/dashboard/overview-recent"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { Receipt, PieChart, Target } from "lucide-react"

export default function DashboardPage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <DashboardHeader
        onAddExpense={() => openAddExpenseRef.current?.()}
        onAddBudget={() => openAddBudgetRef.current?.()}
        onAddIncome={() => openAddIncomeRef.current?.()}
      />

      <div className="mt-8 space-y-6">
        <BudgetExpenseCards />
        <StatCards />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeekCalendar />
          <OverviewRecent />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Transactions</p>
              <p className="text-xs text-muted-foreground">View & filter all</p>
            </div>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10 text-[hsl(var(--chart-2))]">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Analytics</p>
              <p className="text-xs text-muted-foreground">Charts & breakdown</p>
            </div>
          </Link>
          <Link
            href="/dashboard/budgets"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-3/10 text-[hsl(var(--chart-3))]">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Budgets</p>
              <p className="text-xs text-muted-foreground">Set & track limits</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
