"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BudgetExpenseCards } from "@/components/dashboard/budget-expense-cards"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"

export default function BudgetsPage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <DashboardHeader
        onAddExpense={() => openAddExpenseRef.current?.()}
        onAddBudget={() => openAddBudgetRef.current?.()}
        onAddIncome={() => openAddIncomeRef.current?.()}
      />
      <p className="mt-1 text-sm text-muted-foreground">
        Set a monthly budget and track spending by category.
      </p>

      <div className="mt-8 space-y-6">
        <BudgetExpenseCards />
        <BudgetProgress onManage={() => openAddBudgetRef.current?.()} />
      </div>
    </div>
  )
}
