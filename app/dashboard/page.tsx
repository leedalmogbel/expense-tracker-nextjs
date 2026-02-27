"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BudgetExpenseCards } from "@/components/dashboard/budget-expense-cards"
import { StatCards } from "@/components/dashboard/stat-cards"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { Receipt, PieChart, Target, Wallet, ShoppingBasket } from "lucide-react"
import { staggerContainer, fadeUpItem } from "@/lib/utils"
import { CreditCardDueBanner } from "@/components/dashboard/credit-card-due-banner"
import { MobileFinanceSummary } from "@/components/dashboard/mobile-finance-summary"

export default function DashboardPage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <DashboardHeader
        onAddExpense={() => openAddExpenseRef.current?.()}
        onAddBudget={() => openAddBudgetRef.current?.()}
        onAddIncome={() => openAddIncomeRef.current?.()}
      />

      <motion.div
        className="mt-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUpItem}>
          <CreditCardDueBanner />
        </motion.div>
        {/* Mobile: compact unified summary */}
        <motion.div variants={fadeUpItem}>
          <MobileFinanceSummary />
        </motion.div>
        {/* Desktop: full stat cards */}
        <motion.div variants={fadeUpItem} className="hidden lg:block">
          <BudgetExpenseCards />
        </motion.div>
        <motion.div variants={fadeUpItem} className="hidden lg:block">
          <StatCards />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <ActivityFeed />
        </motion.div>

        <motion.div variants={fadeUpItem} className="hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-3 rounded-xl border border-border bg-card/80 backdrop-blur-xl p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group dark:bg-card/60 dark:border-white/[0.06]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Transactions</p>
              <p className="text-xs text-muted-foreground">View & filter all</p>
            </div>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 rounded-xl border border-border bg-card/80 backdrop-blur-xl p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group dark:bg-card/60 dark:border-white/[0.06]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10 text-[hsl(var(--chart-2))] transition-all duration-300 group-hover:bg-[hsl(var(--chart-2))] group-hover:text-white group-hover:scale-110">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Analytics</p>
              <p className="text-xs text-muted-foreground">Charts & breakdown</p>
            </div>
          </Link>
          <Link
            href="/dashboard/budgets"
            className="flex items-center gap-3 rounded-xl border border-border bg-card/80 backdrop-blur-xl p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group dark:bg-card/60 dark:border-white/[0.06]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-3/10 text-[hsl(var(--chart-3))] transition-all duration-300 group-hover:bg-[hsl(var(--chart-3))] group-hover:text-white group-hover:scale-110">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Budgets</p>
              <p className="text-xs text-muted-foreground">Set & track limits</p>
            </div>
          </Link>
          <Link
            href="/dashboard/income"
            className="flex items-center gap-3 rounded-xl border border-border bg-card/80 backdrop-blur-xl p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group dark:bg-card/60 dark:border-white/[0.06]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-4/10 text-[hsl(var(--chart-4))] transition-all duration-300 group-hover:bg-[hsl(var(--chart-4))] group-hover:text-white group-hover:scale-110">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Income</p>
              <p className="text-xs text-muted-foreground">Sources & trends</p>
            </div>
          </Link>
          <Link
            href="/dashboard/shopping-trips"
            className="flex items-center gap-3 rounded-xl border border-border bg-card/80 backdrop-blur-xl p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group dark:bg-card/60 dark:border-white/[0.06]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-5/10 text-[hsl(var(--chart-5))] transition-all duration-300 group-hover:bg-[hsl(var(--chart-5))] group-hover:text-white group-hover:scale-110">
              <ShoppingBasket className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">Shopping Trips</p>
              <p className="text-xs text-muted-foreground">Track & finish trips</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
