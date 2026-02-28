"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useExpense } from "@/contexts/expense-context"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { getCategoryIconComponent } from "@/lib/category-icons"
import { CATEGORIES, CATEGORY_ICONS, INCOME_CATEGORIES, INCOME_CATEGORY_ICONS } from "@/lib/constants"
import { staggerContainer, fadeUpItem, cn } from "@/lib/utils"
import { Grid3X3, ArrowLeft, Plus, ChevronRight } from "lucide-react"
import { format, parseISO } from "date-fns"

type CategorySummary = {
  name: string
  icon: string
  type: "expense" | "income"
  count: number
  total: number
}

export default function CategoriesPage() {
  const { transactions, formatCurrency } = useExpense()
  const { openAddExpenseRef, openAddIncomeRef } = useDashboardActions()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const map = new Map<string, CategorySummary>()

    // Initialize expense categories
    CATEGORIES.forEach((name) => {
      map.set(`expense:${name}`, {
        name,
        icon: CATEGORY_ICONS[name] ?? "circle-dot",
        type: "expense",
        count: 0,
        total: 0,
      })
    })

    // Initialize income categories
    INCOME_CATEGORIES.forEach((name) => {
      map.set(`income:${name}`, {
        name,
        icon: INCOME_CATEGORY_ICONS[name] ?? "circle-dot",
        type: "income",
        count: 0,
        total: 0,
      })
    })

    // Tally transactions
    transactions.forEach((t) => {
      const type = t.amount >= 0 ? "income" : "expense"
      const key = `${type}:${t.category}`
      const entry = map.get(key)
      if (entry) {
        entry.count++
        entry.total += Math.abs(t.amount)
      }
    })

    return Array.from(map.values()).filter((c) => c.count > 0 || c.type === "expense")
  }, [transactions])

  const expenseCategories = categories.filter((c) => c.type === "expense")
  const incomeCategories = categories.filter((c) => c.type === "income" && c.count > 0)

  const selectedTransactions = useMemo(() => {
    if (!selectedCategory) return []
    return transactions
      .filter((t) => t.category === selectedCategory)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, selectedCategory])

  const selectedSummary = categories.find((c) => c.name === selectedCategory)

  // Group selected transactions by month
  const groupedTransactions = useMemo(() => {
    const byMonth: Record<string, typeof selectedTransactions> = {}
    selectedTransactions.forEach((t) => {
      const monthKey = t.date.slice(0, 7) // "YYYY-MM"
      if (!byMonth[monthKey]) byMonth[monthKey] = []
      byMonth[monthKey].push(t)
    })
    return Object.entries(byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, txs]) => ({
        key,
        label: format(parseISO(key + "-01"), "MMMM yyyy"),
        transactions: txs,
      }))
  }, [selectedTransactions])

  // Detail view for a selected category
  if (selectedCategory && selectedSummary) {
    const Icon = getCategoryIconComponent(selectedSummary.icon)
    return (
      <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
        <div className="max-w-3xl">
          {/* Back + header */}
          <div className="mb-6 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setSelectedCategory(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{selectedCategory}</h1>
              <p className="text-sm text-muted-foreground">
                {selectedSummary.count} transaction{selectedSummary.count !== 1 ? "s" : ""} &middot; {formatCurrency(selectedSummary.type === "income" ? selectedSummary.total : -selectedSummary.total)}
              </p>
            </div>
          </div>

          {/* Transactions by month */}
          {groupedTransactions.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No transactions in this category yet.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border overflow-hidden">
              <CardContent className="p-0">
                {groupedTransactions.map((group, gi) => (
                  <div key={group.key}>
                    {/* Month header */}
                    <div className={cn("flex items-center justify-between bg-muted/30 dark:bg-muted/10 px-4 py-2.5 sm:px-6", gi > 0 && "border-t border-border")}>
                      <span className="text-sm font-semibold text-foreground">{group.label}</span>
                    </div>
                    {/* Transactions */}
                    {group.transactions.map((tx) => {
                      const TxIcon = getCategoryIconComponent(tx.icon)
                      const isIncome = tx.amount > 0
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center gap-3 px-4 py-3 sm:px-6 transition-colors hover:bg-muted/20"
                        >
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            isIncome ? "bg-primary/10 text-primary" : "bg-muted/80 dark:bg-muted/40 text-muted-foreground"
                          )}>
                            <TxIcon className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(parseISO(tx.date), "MMM d")}
                              {tx.paymentMethod && ` \u00B7 ${tx.paymentMethod}`}
                            </p>
                          </div>
                          <span className={cn(
                            "text-sm font-semibold tabular-nums shrink-0",
                            isIncome ? "text-primary" : "text-foreground"
                          )}>
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Add button */}
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => {
                if (selectedSummary.type === "income") {
                  openAddIncomeRef.current?.()
                } else {
                  openAddExpenseRef.current?.()
                }
              }}
              className="gap-2 rounded-full px-6"
            >
              <Plus className="h-4 w-4" />
              Add {selectedSummary.type === "income" ? "Income" : "Expense"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <div className="max-w-4xl">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Grid3X3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Categories</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Browse spending and income by category.
            </p>
          </div>
        </div>

        <motion.div className="space-y-8" variants={staggerContainer} initial="hidden" animate="visible">
          {/* Expense categories */}
          <motion.div variants={fadeUpItem}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1">Expenses</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {expenseCategories.map((cat) => {
                const Icon = getCategoryIconComponent(cat.icon)
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card/80 p-4 sm:p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.97]"
                  >
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-center min-w-0 w-full">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{cat.name}</p>
                      {cat.count > 0 ? (
                        <p className="text-[10px] sm:text-xs text-muted-foreground tabular-nums mt-0.5">
                          {formatCurrency(-cat.total)}
                        </p>
                      ) : (
                        <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">No transactions</p>
                      )}
                    </div>
                  </button>
                )
              })}
              {/* Add more button */}
              <button
                onClick={() => openAddExpenseRef.current?.()}
                className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-border p-4 sm:p-5 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.97]"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Add Expense</p>
              </button>
            </div>
          </motion.div>

          {/* Income categories */}
          {incomeCategories.length > 0 && (
            <motion.div variants={fadeUpItem}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1">Income</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {incomeCategories.map((cat) => {
                  const Icon = getCategoryIconComponent(cat.icon)
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card/80 p-4 sm:p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.97]"
                    >
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="text-center min-w-0 w-full">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">{cat.name}</p>
                        <p className="text-[10px] sm:text-xs text-primary tabular-nums mt-0.5">
                          +{formatCurrency(cat.total)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
