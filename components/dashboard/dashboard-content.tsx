"use client"

import { useState, useEffect } from "react"
import { useSidebar } from "@/contexts/sidebar-context"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar"
import { DashboardMobileHeader } from "@/components/dashboard/dashboard-mobile-header"
import { AddExpenseModal } from "@/components/dashboard/add-expense-modal"
import { AddBudgetModal } from "@/components/dashboard/add-budget-modal"
import { AddIncomeModal } from "@/components/dashboard/add-income-modal"
import { cn } from "@/lib/utils"

/**
 * App shell content area: flex layout with spacer (no margin) so content is flush with sidebar.
 * Owns Add modals so the topbar "Add" menu works from any dashboard route.
 */
export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const { openAddModalRef, openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [addBudgetOpen, setAddBudgetOpen] = useState(false)
  const [addIncomeOpen, setAddIncomeOpen] = useState(false)

  useEffect(() => {
    openAddModalRef.current = (type) => {
      if (type === "expense") setAddExpenseOpen(true)
      else if (type === "budget") setAddBudgetOpen(true)
      else if (type === "income") setAddIncomeOpen(true)
    }
    openAddExpenseRef.current = () => setAddExpenseOpen(true)
    openAddBudgetRef.current = () => setAddBudgetOpen(true)
    openAddIncomeRef.current = () => setAddIncomeOpen(true)
    return () => {
      openAddModalRef.current = null
      openAddExpenseRef.current = null
      openAddBudgetRef.current = null
      openAddIncomeRef.current = null
    }
  }, [openAddModalRef, openAddExpenseRef, openAddBudgetRef, openAddIncomeRef])

  return (
    <div className="flex min-h-screen flex-1 min-w-0">
      <div
        className={cn(
          "hidden shrink-0 transition-[width] duration-300 lg:block",
          collapsed ? "w-[72px]" : "w-64"
        )}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-8 lg:px-6">
          <DashboardMobileHeader />
          {children}
        </main>
      </div>
      <AddExpenseModal open={addExpenseOpen} onOpenChange={setAddExpenseOpen} />
      <AddBudgetModal open={addBudgetOpen} onOpenChange={setAddBudgetOpen} />
      <AddIncomeModal open={addIncomeOpen} onOpenChange={setAddIncomeOpen} />
    </div>
  )
}
