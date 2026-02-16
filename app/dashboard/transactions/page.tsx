"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AnalyticsBarChart } from "@/components/dashboard/analytics-bar-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"

export default function TransactionsPage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <DashboardHeader
        onAddExpense={() => openAddExpenseRef.current?.()}
        onAddBudget={() => openAddBudgetRef.current?.()}
        onAddIncome={() => openAddIncomeRef.current?.()}
      />
      <p className="mt-1 text-sm text-muted-foreground">
        Filter by month using the chart, then by category. Grouped by date.
      </p>

      <div className="mt-8 space-y-6">
        <AnalyticsBarChart />
        <RecentTransactions />
      </div>
    </div>
  )
}
