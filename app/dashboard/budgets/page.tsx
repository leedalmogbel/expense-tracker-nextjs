"use client"

import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BudgetExpenseCards } from "@/components/dashboard/budget-expense-cards"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { staggerContainer, fadeUpItem } from "@/lib/utils"

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

      <motion.div
        className="mt-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUpItem}>
          <BudgetExpenseCards />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <BudgetProgress onManage={() => openAddBudgetRef.current?.()} />
        </motion.div>
      </motion.div>
    </div>
  )
}
